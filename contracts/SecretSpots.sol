// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract SecretSpots is Ownable, ReentrancyGuard {
    enum SpotCategory { 
        FOOD_BEVERAGES,
        NATURE,
        CULTURAL,
        PHOTO,
        HISTORICAL,
        LOCAL_EXPERIENCE,
        NIGHTLIFE,
        I_KNOW_A_PLACE
    }

    struct Spot {
        uint256 id;
        address creator;
        string username;
        SpotCategory category;
        uint256 upvotes;
        uint256 downvotes;
        uint256 timestamp;
        bool isActive;
    }

    struct User {
        bool isRegistered;
        string username;
        uint256 credibilityScore;
        uint256 level;
    }

    mapping(address => User) public users;
    mapping(uint256 => Spot) public spots;
    mapping(address => mapping(uint256 => bool)) public hasVoted;
    
    uint256 public spotCounter;
    uint256 public constant REWARD_PER_UPVOTE = 0.01 ether; // 0.01 ETH

    event UserRegistered(address indexed user, string username);
    event SpotCreated(uint256 indexed spotId, address indexed creator, string username);
    event SpotVoted(uint256 indexed spotId, address indexed voter, bool isUpvote);
    event SpotDeleted(uint256 indexed spotId, address indexed creator);
    event LevelUp(address indexed user, uint256 newLevel);
    event RewardSent(address indexed creator, uint256 amount);

    modifier onlyRegisteredUser() {
        require(users[msg.sender].isRegistered, "User not registered");
        _;
    }

    receive() external payable {} // Allow contract to receive Ether

    constructor() Ownable(msg.sender) ReentrancyGuard() {}

    function registerUser(string calldata _username) external {
        require(!users[msg.sender].isRegistered, "User already registered");
        users[msg.sender] = User({
            isRegistered: true,
            username: _username,
            credibilityScore: 0,
            level: 1
        });
        emit UserRegistered(msg.sender, _username);
    }

    function createSpot(SpotCategory _category) external onlyRegisteredUser {
        spotCounter++;
        
        spots[spotCounter] = Spot({
            id: spotCounter,
            creator: msg.sender,
            username: users[msg.sender].username,
            category: _category,
            upvotes: 0,
            downvotes: 0,
            timestamp: block.timestamp,
            isActive: true
        });
        
        emit SpotCreated(spotCounter, msg.sender, users[msg.sender].username);
    }

    function voteSpot(uint256 _spotId, bool _isUpvote) external payable onlyRegisteredUser nonReentrant {
        require(_spotId <= spotCounter && _spotId > 0, "Invalid spot ID");
        require(!hasVoted[msg.sender][_spotId], "Already voted");
        require(spots[_spotId].creator != msg.sender, "Cannot vote own spot");

        Spot storage spot = spots[_spotId];
        address creator = spot.creator;

        if (_isUpvote) {
            // Ensure correct Ether amount is sent
            require(msg.value == REWARD_PER_UPVOTE, "Incorrect Ether amount");
            
            // Transfer Ether to spot creator
            (bool success, ) = payable(creator).call{value: msg.value}("");
            require(success, "Ether transfer failed");

            spot.upvotes++;
            users[creator].credibilityScore++;
            
            emit RewardSent(creator, msg.value);
        } else {
            spot.downvotes++;
            if (users[creator].credibilityScore > 0) {
                users[creator].credibilityScore--;
            }
        }

        hasVoted[msg.sender][_spotId] = true;
        checkAndUpdateLevel(creator);
        emit SpotVoted(_spotId, msg.sender, _isUpvote);
    }

    function deleteSpot(uint256 _spotId) external onlyRegisteredUser {
        require(_spotId <= spotCounter && _spotId > 0, "Invalid spot ID");
        Spot storage spot = spots[_spotId];
        require(spot.creator == msg.sender, "Only the creator can delete this spot");
        require(spot.isActive, "Spot is already inactive");

        // Adjust user's credibility score and level
        users[msg.sender].credibilityScore -= spot.upvotes;
        checkAndUpdateLevel(msg.sender);

        spot.isActive = false;
        emit SpotDeleted(_spotId, msg.sender);
    }

    function checkAndUpdateLevel(address _user) internal {
        uint256 currentLevel = users[_user].level;
        uint256 newLevel = (users[_user].credibilityScore / 100) + 1;
        
        if (newLevel > currentLevel) {
            users[_user].level = newLevel;
            emit LevelUp(_user, newLevel);
        }
    }

    // Withdraw function for contract owner in case of any leftover funds
    function withdrawFunds() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");
        payable(owner()).transfer(balance);
    }
}