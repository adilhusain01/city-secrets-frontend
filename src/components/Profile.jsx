import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSecretSpots } from "../contexts/SecretSpotsContext";
import SpotCard from "./SpotCard";
import { User, Trophy, ThumbsUp, MapPin, Trash2, Loader } from "lucide-react";
import axios from "axios";
import { toast } from "react-hot-toast";

const Profile = () => {
  const {
    account,
    userLevel,
    userSpots,
    credibilityScore,
    loading,
    fetchUserSpots,
    contract,
    username,
    registerUser,
    contractError,
    isRegisteredUser,
  } = useSecretSpots();

  const [deleteLoading, setDeleteLoading] = useState(false);
  const [error, setError] = useState(null);
  const [registrationLoading, setRegistrationLoading] = useState(false);
  const [usernameInput, setUsernameInput] = useState("");

  const getUserInfo = async () => {
    if (contract && account) {
      try {
        const user = await contract.users(account);
        setError(null);
      } catch (error) {
        console.error("Error fetching user info:", error);
        setError("Failed to fetch user information");
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    getUserInfo();
    fetchUserSpots();
  }, []);

  useEffect(() => {
    getUserInfo();
    fetchUserSpots();
  }, [contract, account]);

  const handleDeleteSpot = async (spotId) => {
    try {
      setDeleteLoading(true);
      // Delete spot from contract
      const tx = await contract.deleteSpot(spotId);
      await tx.wait();

      // Delete spot from backend
      await axios.delete(
        `https://city-secrets-backend-6ptmq.ondigitalocean.app/api/spots/${spotId}`
      );

      await fetchUserSpots();
      toast.success("Spot deleted successfully");
    } catch (error) {
      console.error("Error deleting spot:", error);
      toast.error("Failed to delete spot");
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!usernameInput.trim()) {
      setError("Please enter a username");
      return;
    }

    try {
      setRegistrationLoading(true);
      await registerUser(usernameInput);
      setUsernameInput("");
      setError(null);
    } catch (err) {
      setError(err.message || "Registration failed");
    } finally {
      setRegistrationLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 50 },
    },
  };

  if (contractError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className=" bg-gradient-to-b from-black to-gray-900 border-2 border-[#8a090a] p-8 rounded-md shadow-[0_0_15px_rgba(138,9,10,0.3)] text-center max-w-xl mx-4"
        >
          <h2 className="text-2xl font-bold text-yellow-500 mb-4">Error</h2>
          <p className="text-white">{contractError}</p>
        </motion.div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-black to-gray-900">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-[#8a090a] border-t-yellow-500 rounded-full"
        />
      </div>
    );
  }

  if (!isRegisteredUser) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black to-gray-900 flex items-center justify-center">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-black border-2 border-[#8a090a] p-8 rounded-md shadow-[0_0_15px_rgba(138,9,10,0.3)] max-w-md w-full"
        >
          <h2 className="text-3xl font-bold text-yellow-500 mb-6 text-center">
            Welcome to Secret Spots
          </h2>

          <div className="space-y-4">
            <div className="relative">
              <input
                type="text"
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                placeholder="Choose a username"
                className="w-full px-6 py-4 rounded-md bg-black border-2 border-[#8a090a] focus:outline-none focus:border-yellow-500 text-white placeholder-gray-500"
              />
              <User className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[#8a090a]" />
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#8a090a]/20 border-2 border-[#8a090a] px-4 py-2 rounded-md text-white"
              >
                {error}
              </motion.div>
            )}

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleRegister}
              disabled={registrationLoading}
              className="w-full px-6 py-4 rounded-md bg-[#8a090a] text-white font-semibold flex items-center justify-center gap-2 hover:bg-[#a01011] transition-all border-2 border-[#8a090a]"
            >
              {registrationLoading ? (
                <Loader className="animate-spin" />
              ) : (
                <User />
              )}
              {registrationLoading ? "Registering..." : "Create Account"}
            </motion.button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen container mx-auto px-6 py-12 bg-black">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 relative z-10"
      >
        {/* Profile Header */}
        <motion.div
          variants={itemVariants}
          className="rounded-md p-8 bg-black border-2 border-[#8a090a] shadow-[0_0_15px_rgba(138,9,10,0.3)]"
        >
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="w-32 h-32 rounded-full bg-[#8a090a]/30 border-2 border-[#8a090a] flex items-center justify-center">
              <User size={48} className="text-yellow-500" />
            </div>

            <div className="flex-1 space-y-4">
              <h2 className="text-3xl font-bold text-yellow-500">
                @{username}
              </h2>
              <div className="flex flex-wrap gap-6">
                <div className="flex items-center gap-2 bg-[#8a090a]/20 border border-[#8a090a] px-4 py-2 rounded-md">
                  <Trophy className="text-yellow-500" />
                  <span className="font-semibold text-white">
                    Level {userLevel}
                  </span>
                </div>
                <div className="flex items-center gap-2 bg-[#8a090a]/20 border border-[#8a090a] px-4 py-2 rounded-md">
                  <ThumbsUp className="text-yellow-500" />
                  <span className="font-semibold text-white">
                    {credibilityScore} Credibility Points
                  </span>
                </div>
                <div className="flex items-center gap-2 bg-[#8a090a]/20 border border-[#8a090a] px-4 py-2 rounded-md">
                  <MapPin className="text-yellow-500" />
                  <span className="font-semibold text-white">
                    {userSpots.length} Spots Created
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* User's Spots */}
        <motion.div variants={itemVariants}>
          <h3 className="text-2xl font-bold text-yellow-500 mb-6">My Spots</h3>
          {loading ? (
            <div className="min-h-[40vh] flex justify-center items-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="w-16 h-16 border-4 border-[#8a090a] border-t-yellow-500 rounded-full"
              />
            </div>
          ) : userSpots.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {userSpots.map((spot) => (
                <motion.div
                  key={spot.spotId}
                  variants={itemVariants}
                  className="relative"
                >
                  <SpotCard spot={spot} />
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleDeleteSpot(spot.spotId)}
                    disabled={deleteLoading}
                    className="absolute top-4 right-4 p-2 bg-[#8a090a] hover:bg-[#a01011] text-white rounded-md border border-[#8a090a]"
                  >
                    {deleteLoading ? (
                      <Loader className="animate-spin" />
                    ) : (
                      <Trash2 size={20} />
                    )}
                  </motion.button>
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.div
              variants={itemVariants}
              className="min-h-[40vh] flex items-center justify-center"
            >
              <div className="text-center bg-black border-2 border-[#8a090a] p-8 rounded-md shadow-[0_0_15px_rgba(138,9,10,0.3)]">
                <p className="text-white text-xl">
                  You haven't created any spots yet.
                </p>
              </div>
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Profile;
