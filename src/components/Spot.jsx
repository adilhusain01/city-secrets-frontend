import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSecretSpots } from "../contexts/SecretSpotsContext";
import {
  ThumbsUp,
  ThumbsDown,
  Calendar,
  User,
  ArrowLeft,
  X,
} from "lucide-react";
import { motion } from "framer-motion";
import axios from "axios";

const Spot = () => {
  const { spotId } = useParams();
  const navigate = useNavigate();
  const { account, voteSpot, loading, contract, fetchSpots, addComment } =
    useSecretSpots();
  const [spotData, setSpotData] = useState(null);
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");

  const fetchSpotData = async () => {
    try {
      // Fetch spot data from the contract
      const spot = await contract.spots(spotId);
      const creatorData = await contract.users(spot.creator);

      // Fetch additional data from the backend
      const response = await axios.get(
        `https://city-secrets-backend-6ptmq.ondigitalocean.app/api/spots/id/${spotId}`
      );
      const backendData = response.data;

      setSpotData({
        ...spot,
        upvotes: spot.upvotes.toString(),
        downvotes: spot.downvotes.toString(),
        creatorCredibility: {
          score: creatorData.credibilityScore.toString(),
          level: creatorData.level.toString(),
        },
        ...backendData, // Merge backend data
      });
    } catch (error) {
      console.error("Error fetching spot data:", error);
    }
  };

  const fetchComments = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/comments/${spotId}`
      );
      setComments(response.data);
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  };

  useEffect(() => {
    fetchSpotData();
    fetchComments();
    fetchSpots();
  }, [spotId]);

  const handleVote = async (isUpvote) => {
    try {
      await voteSpot(spotId, isUpvote);
      await fetchSpotData();
    } catch (error) {
      console.error("Error voting:", error);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      await addComment(spotId, newComment);
      setNewComment("");
      fetchComments(); // Refresh comments after posting
      toast.success("Comment added successfully");
    } catch (error) {
      console.error("Error adding comment:", error);
      toast.error("Failed to add comment");
    }
  };

  const openModal = (index) => {
    setActivePhotoIndex(index);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  if (!spotData)
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-black">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-[#8a090a] border-t-yellow-500 rounded-full"
        />
      </div>
    );

  const mainPhoto = spotData.photos?.[0];
  const otherPhotos = spotData.photos?.slice(1);

  return (
    <div className="min-h-screen py-8 bg-gradient-to-b from-black to-gray-900">
      <div className="max-w-5xl mx-auto px-4">
        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="mt-28 px-6 py-2 mb-6 flex items-center gap-2 text-white bg-[#8a090a] hover:bg-[#a01011] transition-all duration-300 rounded-md border-2 border-[#8a090a]"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </button>

        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <h2 className="text-3xl font-bold text-yellow-500">
            {spotData.name}
          </h2>
        </div>

        {/* Main Photo Gallery */}
        <div className="relative h-96 mb-8 rounded-md overflow-hidden border-2 border-[#8a090a]">
          <motion.img
            src={mainPhoto}
            alt={spotData.name}
            className="w-full h-full object-cover cursor-pointer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            onClick={() => openModal(0)}
          />
          {spotData.photos?.length > 1 && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
              {spotData.photos.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActivePhotoIndex(index)}
                  className={`w-2 h-2 rounded-full \${
                    index === activePhotoIndex ? "bg-yellow-500" : "bg-white/50"
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Other Photos Grid */}
        {otherPhotos?.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-8">
            {otherPhotos.map((photo, index) => (
              <motion.div
                key={index}
                className="relative h-64 rounded-md overflow-hidden cursor-pointer border-2 border-[#8a090a]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                onClick={() => openModal(index + 1)}
              >
                <img
                  src={photo}
                  alt={`\${spotData.name} \${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </motion.div>
            ))}
          </div>
        )}

        {/* Content Grid */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Left Column - Details */}
          <div className="space-y-6">
            <div className="bg-black border-2 border-[#8a090a] p-6 rounded-md shadow-[0_0_15px_rgba(138,9,10,0.3)]">
              <h3 className="text-xl font-semibold mb-4 text-yellow-500">
                About this spot
              </h3>
              <p className="text-white">{spotData.description}</p>
            </div>

            <div className="bg-black border-2 border-[#8a090a] p-6 rounded-md shadow-[0_0_15px_rgba(138,9,10,0.3)]">
              <h3 className="text-xl font-semibold text-yellow-500">
                Location Details
              </h3>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <p className="text-sm text-gray-400">Latitude</p>
                  <p className="font-medium text-white">
                    {spotData.location.latitude}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Longitude</p>
                  <p className="font-medium text-white">
                    {spotData.location.longitude}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-gray-400">Address</p>
                  <p className="font-medium text-white">
                    {spotData.location.fullAddress}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-gray-400">City</p>
                  <p className="font-medium text-white">
                    {spotData.location.city + ", " + spotData.location.state}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Stats & Actions */}
          <div className="space-y-6">
            <div className="bg-black border-2 border-[#8a090a] p-6 rounded-md shadow-[0_0_15px_rgba(138,9,10,0.3)]">
              <h3 className="text-xl font-semibold mb-4 text-yellow-500">
                Creator Info
              </h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-[#8a090a]" />
                  <span className="font-medium text-white">
                    {spotData.creator.slice(0, 6) +
                      "..." +
                      spotData.creator.slice(-4)}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-[#8a090a]" />
                  <span className="text-white">
                    {new Date(spotData.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Voting Section */}
            <div className="bg-black border-2 border-[#8a090a] p-6 rounded-md shadow-[0_0_15px_rgba(138,9,10,0.3)]">
              <h3 className="text-xl font-semibold mb-4 text-yellow-500">
                Vote for this spot
              </h3>
              <div className="flex gap-4">
                <button
                  onClick={() => handleVote(true)}
                  disabled={loading}
                  className="flex-1 bg-[#8a090a] text-white px-6 py-3 rounded-md flex items-center justify-center gap-2 hover:bg-[#a01011] disabled:bg-gray-600 transition-colors border-2 border-[#8a090a]"
                >
                  <ThumbsUp className="w-5 h-5" />
                  <span>{spotData.upvotes || 0}</span>
                </button>
                <button
                  onClick={() => handleVote(false)}
                  disabled={loading}
                  className="flex-1 bg-[#8a090a] text-white px-6 py-3 rounded-md flex items-center justify-center gap-2 hover:bg-[#a01011] disabled:bg-gray-600 transition-colors border-2 border-[#8a090a]"
                >
                  <ThumbsDown className="w-5 h-5" />
                  <span>{spotData.downvotes || 0}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Comments Section */}
      <div className="max-w-5xl mx-auto px-4 mt-16">
        <h3 className="text-2xl font-semibold mb-4 text-yellow-500">
          Comments
        </h3>

        {/* Comment Form */}
        {account && account !== spotData.creator && (
          <form onSubmit={handleCommentSubmit} className="mb-6">
            <div className="flex gap-2">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="flex-1 p-3 bg-black border-2 border-[#8a090a] rounded-md resize-none focus:outline-none focus:border-yellow-500 text-white placeholder-gray-500"
                rows="2"
              />
              <button
                type="submit"
                disabled={!newComment.trim()}
                className="px-6 py-2 bg-[#8a090a] text-white rounded-md hover:bg-[#a01011] disabled:bg-gray-600 disabled:cursor-not-allowed border-2 border-[#8a090a]"
              >
                Post
              </button>
            </div>
          </form>
        )}

        {/* Comments List */}
        <div className="space-y-4 mb-20">
          {comments.length === 0 ? (
            <p className="text-gray-400">No comments yet.</p>
          ) : (
            comments.map((comment) => (
              <div
                key={comment._id}
                className="bg-black border-2 border-[#8a090a] p-4 rounded-md shadow-[0_0_15px_rgba(138,9,10,0.3)]"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-medium text-yellow-500">
                    @{comment.username}
                  </span>
                  <span className="text-gray-400 text-sm">
                    {new Date(comment.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-white">{comment.content}</p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Photo Modal */}
      {isModalOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={closeModal}
        >
          <div className="relative max-w-4xl w-full">
            <button
              onClick={closeModal}
              className="absolute top-2 right-2 text-white bg-[#8a090a] rounded-full p-2 hover:bg-[#a01011] transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            <motion.img
              src={spotData.photos[activePhotoIndex]}
              alt={spotData.name}
              className="w-full h-full object-contain max-h-[90vh] rounded-md border-2 border-[#8a090a]"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default Spot;
