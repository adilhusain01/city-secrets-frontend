import { createContext, useContext, useState, useEffect } from "react";
import { ethers } from "ethers";
import axios from "axios";
import { useWallet } from "./WalletContext";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "../utils/contractHelpers";
import { toast } from "react-hot-toast";

const SecretSpotsContext = createContext();

const API_BASE_URL = "https://city-secrets-backend-6ptmq.ondigitalocean.app";

const SpotCategory = {
  FOOD_BEVERAGES: 0,
  NATURE: 1,
  CULTURAL: 2,
  PHOTO: 3,
  HISTORICAL: 4,
  LOCAL_EXPERIENCE: 5,
  NIGHTLIFE: 6,
  I_KNOW_A_PLACE: 7,
};

export const SecretSpotsProvider = ({ children }) => {
  const { account, signer } = useWallet();
  const [contract, setContract] = useState(null);
  const [contractError, setContractError] = useState(null);
  const [spots, setSpots] = useState([]);
  const [userSpots, setUserSpots] = useState([]);
  const [isRegisteredUser, setIsRegisteredUser] = useState(false);
  const [userLevel, setUserLevel] = useState(1);
  const [credibilityScore, setCredibilityScore] = useState(0);
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState("");

  useEffect(() => {
    const initializeContract = async () => {
      try {
        if (!signer) {
          setContractError("Wallet not connected");
          toast.error("Wallet not connected");
          return;
        }

        if (!CONTRACT_ADDRESS) {
          setContractError("Contract address not configured");
          toast.error("Contract address not configured");
          return;
        }

        const secretSpotsContract = new ethers.Contract(
          CONTRACT_ADDRESS,
          CONTRACT_ABI,
          signer
        );

        // Verify contract connection
        try {
          // Try to call a view function to verify contract connection
          await secretSpotsContract.users(account);
          setContract(secretSpotsContract);
          setContractError(null);
          console.log("Contract initialized successfully");
        } catch (error) {
          setContractError("Error connecting to contract");
          toast.error("Error connecting to contract");
          console.error("Contract initialization error:", error);
        }
      } catch (error) {
        setContractError("Failed to initialize contract");
        toast.error("Failed to initialize contract");
        console.error("Contract setup error:", error);
      }
    };

    initializeContract();
  }, [signer, account]);

  useEffect(() => {
    if (contract && account) {
      checkUserRegistration();
    }
  }, [contract, account]);

  // Check if user is registered
  const checkUserRegistration = async () => {
    if (contract && account) {
      try {
        const user = await contract.users(account);
        setIsRegisteredUser(user.isRegistered);
        setUserLevel(user.level.toNumber());
        setCredibilityScore(user.credibilityScore.toNumber());
        setUsername(user.username);
      } catch (error) {
        console.error("Error checking user registration:", error);
      }
    }
  };

  const registerUser = async (username) => {
    try {
      setLoading(true);
      // Register on blockchain
      const tx = await contract.registerUser(username);
      await tx.wait();

      // Register on backend
      await axios.post(`${API_BASE_URL}/api/users/register`, {
        walletAddress: account,
        username,
      });

      await checkUserRegistration();
      setLoading(false);
      toast.success("User registered successfully");
    } catch (error) {
      setLoading(false);
      toast.error("Error registering user");
      console.error("Error registering user:", error);
    }
  };

  // Create spot
  const createSpot = async (spotData) => {
    try {
      setLoading(true);
      setContractError(null);

      const requiredFields = [
        "name",
        "description",
        "category",
        "city",
        "state",
        "address",
        "latitude",
        "longitude",
      ];

      const missingFields = requiredFields.filter((field) => !spotData[field]);

      if (missingFields.length > 0) {
        throw new Error(
          `Missing required fields: \${missingFields.join(', ')}`
        );
      }

      // Validate photos array (if required)
      if (!spotData.photos || spotData.photos.length === 0) {
        throw new Error("At least one photo is required");
      }

      const { name, description, category, city, state, address, photos } =
        spotData;

      // Convert coordinates to the format expected by your contract
      const latitude = parseFloat(spotData.latitude);
      const longitude = parseFloat(spotData.longitude);

      if (isNaN(latitude) || isNaN(longitude)) {
        throw new Error("Invalid coordinates");
      }

      if (!contract) {
        throw new Error(
          "Contract not initialized. Please connect your wallet."
        );
      }

      if (!account) {
        throw new Error("Wallet not connected. Please connect your wallet.");
      }

      if (!isRegisteredUser) {
        throw new Error("Please register before creating a spot.");
      }

      setLoading(true);

      // Upload photos
      const formData = new FormData();
      photos.forEach((photo) => formData.append("photos", photo));

      const uploadResponse = await axios.post(
        `${API_BASE_URL}/api/upload`,
        formData
      );

      if (!uploadResponse.data || !uploadResponse.data.urls) {
        throw new Error("Failed to upload photos");
      }

      const photoUrls = uploadResponse.data.urls;

      const categoryNumber = SpotCategory[spotData.category];

      const tx = await contract.createSpot(categoryNumber);

      const receipt = await tx.wait();

      const event = receipt.events?.find((e) => e.event === "SpotCreated");
      if (!event) {
        throw new Error("Spot creation event not found");
      }

      const spotId = event.args.spotId.toNumber();
      const username = event.args.username;

      // Save to backend
      const response = await axios.post(`${API_BASE_URL}/api/spots/create`, {
        spotId,
        creator: account,
        name,
        username,
        description,
        category,
        location: {
          city,
          state,
          fullAddress: address,
          latitude,
          longitude,
        },
        photos: photoUrls,
      });

      await fetchSpots();
      await fetchUserSpots();

      setLoading(false);
      toast.success("Spot created successfully");
      return response.data;
    } catch (error) {
      setLoading(false);
      toast.error(error.message || "Failed to create spot. Please try again.");
      console.error("Error creating spot:", error);
    }
  };

  const voteSpot = async (spotId, isUpvote) => {
    try {
      setLoading(true);
      const voteSpot = async (spotId, isUpvote) => {
        try {
          setLoading(true);

          if (!contract || !account) {
            throw new Error("Contract or account not initialized");
          }

          const user = await contract.users(account);
          if (!user.isRegistered) {
            throw new Error("Please register before voting");
          }

          const hasVoted = await contract.hasVoted(account, spotId);
          if (hasVoted) {
            throw new Error("You have already voted on this spot");
          }

          // Get the reward token contract
          const rewardToken = new ethers.Contract(
            CONTRACT_ADDRESS,
            CONTRACT_ABI,
            signer
          );

          // Approve the contract to spend tokens
          const voteAmount = ethers.utils.parseUnits("0.01", 18); // Adjust decimals as needed
          const approveTx = await rewardToken.approve(
            CONTRACT_ADDRESS,
            voteAmount
          );
          await approveTx.wait();

          console.log("Voting with parameters:", {
            spotId,
            isUpvote,
            account,
          });

          const tx = await contract.voteSpot(spotId, isUpvote, {
            gasLimit: 200000,
          });

          await tx.wait();
          console.log("Vote successful!");

          await fetchSpots();
          await checkUserRegistration(); // Update user's credibility score
          setLoading(false);
          toast.success("Vote submitted successfully");
        } catch (error) {
          console.error("Error voting on spot:", error);
          setLoading(false);
          if (error.message.includes("Cannot vote own spot")) {
            toast.error("You cannot vote on your own spot");
          } else if (error.message.includes("Insufficient token allowance")) {
            toast.error("Insufficient token balance or allowance");
          } else {
            toast.error("Error voting on spot");
          }
        }
      };

      if (!contract || !account) {
        throw new Error("Contract or account not initialized");
      }

      const user = await contract.users(account);
      if (!user.isRegistered) {
        throw new Error("Please register before voting");
      }

      const hasVoted = await contract.hasVoted(account, spotId);
      if (hasVoted) {
        throw new Error("You have already voted on this spot");
      }

      const voteAmount = ethers.utils.parseEther("0.01"); // 0.01 ETH

      console.log("Voting with parameters:", {
        spotId,
        isUpvote,
        account,
        value: voteAmount.toString(),
      });

      const tx = await contract.voteSpot(spotId, isUpvote, {
        value: voteAmount,
        gasLimit: 200000,
      });

      await tx.wait();
      console.log("Vote successful!");

      await fetchSpots();
      await fetchUserSpots();
      await checkUserRegistration(); // Update user's credibility score
      setLoading(false);
      toast.success("Vote submitted successfully");
    } catch (error) {
      console.error("Error voting on spot:", error);
      setLoading(false);
      if (error.message.includes("Cannot vote own spot")) {
        toast.error("You cannot vote on your own spot");
      } else {
        toast.error("Error voting on spot");
      }
    }
  };

  // Add comment
  const addComment = async (spotId, content) => {
    try {
      setLoading(true);
      await axios.post(`${API_BASE_URL}/api/comments/${spotId}/comment`, {
        commenter: account,
        content,
        username,
      });
      await fetchSpots();
      await fetchUserSpots();
      setLoading(false);
      toast.success("Comment added successfully");
    } catch (error) {
      console.error("Error adding comment:", error);
      setLoading(false);
      toast.error("Error adding comment");
    }
  };

  const fetchSpots = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/api/spots`);
      const mongoSpots = response.data;

      const spotsWithData = await Promise.all(
        mongoSpots.map(async (spot) => {
          const contractSpot = await contract.spots(spot.spotId);
          const creatorData = await contract.users(contractSpot.creator);

          return {
            ...spot,
            ...contractSpot,
            upvotes: contractSpot.upvotes.toString(),
            downvotes: contractSpot.downvotes.toString(),
            creatorCredibility: {
              score: creatorData.credibilityScore.toString(),
              level: creatorData.level.toString(),
            },
          };
        })
      );

      setSpots(spotsWithData);
      setLoading(false);
    } catch (error) {
      toast.error("Error fetching spots");
      console.error("Error fetching spots:", error);
    }
  };

  const fetchSpotsByCity = async (city) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/spots/city/${city}`
      );
      const mongoSpots = response.data;

      const spotsWithData = await Promise.all(
        mongoSpots.map(async (spot) => {
          const contractSpot = await contract.spots(spot.spotId);
          const creatorData = await contract.users(contractSpot.creator);

          return {
            ...spot,
            ...contractSpot,
            upvotes: contractSpot.upvotes.toString(),
            downvotes: contractSpot.downvotes.toString(),
            creatorCredibility: {
              score: creatorData.credibilityScore.toString(),
              level: creatorData.level.toString(),
            },
          };
        })
      );

      setSpots(spotsWithData);
    } catch (error) {
      toast.error("Error fetching spots by city");
      console.error("Error fetching spots by city:", error);
    }
  };

  const fetchUserSpots = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/spots/user/${account}`
      );
      const mongoSpots = response.data;

      const spotsWithData = await Promise.all(
        mongoSpots.map(async (spot) => {
          const contractSpot = await contract.spots(spot.spotId);
          const creatorData = await contract.users(contractSpot.creator);

          return {
            ...spot,
            ...contractSpot,
            upvotes: contractSpot.upvotes.toString(),
            downvotes: contractSpot.downvotes.toString(),
            creatorCredibility: {
              score: creatorData.credibilityScore.toString(),
              level: creatorData.level.toString(),
            },
          };
        })
      );

      setUserSpots(spotsWithData);
    } catch (error) {
      toast.error("Error fetching user spots");
      console.error("Error fetching user spots:", error);
    }
  };

  const deleteSpot = async (spotId) => {
    try {
      setLoading(true);
      // Delete spot from contract
      const tx = await contract.deleteSpot(spotId);
      await tx.wait();

      // Delete spot from backend
      await axios.delete(`${API_BASE_URL}/api/spots/${spotId}`);

      await fetchUserSpots();
      toast.success("Spot deleted successfully");
    } catch (error) {
      toast.error("Failed to delete spot");
      console.error("Error deleting spot:", error);
    } finally {
      setLoading(false);
    }
  };

  // Load initial data
  useEffect(() => {
    if (account) {
      fetchSpots();
      fetchUserSpots();
    }
  }, [account]);

  return (
    <SecretSpotsContext.Provider
      value={{
        spots,
        userSpots,
        isRegisteredUser,
        userLevel,
        credibilityScore,
        loading,
        contractError,
        contract,
        username,
        account,
        registerUser,
        createSpot,
        voteSpot,
        addComment,
        fetchSpots,
        fetchSpotsByCity,
        fetchUserSpots,
        deleteSpot,
      }}
    >
      {children}
    </SecretSpotsContext.Provider>
  );
};

export const useSecretSpots = () => useContext(SecretSpotsContext);
