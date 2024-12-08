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
        `https://city-secrets-backend-6ptmq.ondigitalocean.app/api/comments/${spotId}`
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

  if (!spotData) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-[#030712]">
        <div className="relative">
          <div className="w-16 h-16 rounded-full border-2 border-transparent animate-pulse bg-gradient-to-r from-violet-500 via-cyan-500 to-violet-500 p-[2px]">
            <div className="w-full h-full rounded-full bg-[#030712]" />
          </div>
          <div className="absolute inset-0 blur-xl bg-gradient-to-r from-violet-500 via-cyan-500 to-violet-500 opacity-20 animate-pulse" />
        </div>
      </div>
    );
  }

  const mainPhoto = spotData.photos?.[0];
  const otherPhotos = spotData.photos?.slice(1);

  return (
    <div className="min-h-screen py-8 bg-[#030712] bg-grid-white/[0.02]">
      <div className="max-w-6xl mx-auto px-4 relative z-10">
        {/* Navigation */}
        <button
          onClick={() => navigate(-1)}
          className="mt-28 mb-6 group flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
          <span className="text-sm font-medium">Back to Spots</span>
        </button>

        {/* Header */}
        <h1 className="text-4xl font-bold bg-yellow-500 bg-clip-text text-transparent mb-8">
          {spotData.name}
        </h1>

        {/* Main Photo */}
        <div className="relative group rounded-2xl overflow-hidden mb-8 border border-white/10">
          <motion.img
            src={mainPhoto}
            alt={spotData.name}
            className="w-full h-[500px] object-cover cursor-pointer transition-transform duration-500 group-hover:scale-105"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={() => openModal(0)}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

          {/* Photo Navigation */}
          {spotData.photos?.length > 1 && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
              {spotData.photos.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActivePhotoIndex(index)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 \${
                    index === activePhotoIndex 
                      ? "bg-white w-6" 
                      : "bg-white/50 hover:bg-white/75"
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
              <h2 className="text-xl font-semibold text-white mb-4">
                About this spot
              </h2>
              <p className="text-gray-300 leading-relaxed">
                {spotData.description}
              </p>
            </div>

            {/* Location Card */}
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
              <h2 className="text-xl font-semibold text-white mb-4">
                Location Details
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-gray-400">Coordinates</p>
                  <p className="font-mono text-cyan-500">
                    {spotData.location.latitude}, {spotData.location.longitude}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-gray-400">City</p>
                  <p className="text-white">
                    {spotData.location.city}, {spotData.location.state}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Creator Info */}
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
              <h2 className="text-xl font-semibold text-white mb-4">Creator</h2>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-violet-500 to-cyan-500 flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-white font-medium">
                    {spotData.creator.slice(0, 6)}...
                    {spotData.creator.slice(-4)}
                  </p>
                  <p className="text-sm text-gray-400">
                    {new Date(spotData.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Voting Section */}
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
              <h2 className="text-xl font-semibold text-white mb-4">Vote</h2>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => handleVote(true)}
                  disabled={loading}
                  className="flex flex-col items-center gap-2 p-4 rounded-xl bg-gradient-to-r from-violet-500 to-violet-600 hover:from-violet-600 hover:to-violet-700 transition-all disabled:opacity-50"
                >
                  <ThumbsUp className="w-6 h-6 text-white" />
                  <span className="text-white font-medium">
                    {spotData.upvotes || 0}
                  </span>
                </button>
                <button
                  onClick={() => handleVote(false)}
                  disabled={loading}
                  className="flex flex-col items-center gap-2 p-4 rounded-xl bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 transition-all disabled:opacity-50"
                >
                  <ThumbsDown className="w-6 h-6 text-white" />
                  <span className="text-white font-medium">
                    {spotData.downvotes || 0}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Comments Section */}
        <div className="mt-12">
          <h2 className="text-2xl font-semibold text-white mb-6">Comments</h2>

          {/* Comment Form */}
          {account && account !== spotData.creator && (
            <form onSubmit={handleCommentSubmit} className="mb-8">
              <div className="flex gap-4">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Share your thoughts..."
                  className="flex-1 bg-white/5 backdrop-blur-xl rounded-xl p-4 border border-white/10 text-white placeholder-gray-400 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all resize-none"
                  rows="3"
                />
                <button
                  type="submit"
                  disabled={!newComment.trim()}
                  className="px-6 py-2 bg-gradient-to-r from-violet-500 to-cyan-500 rounded-xl text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  Post
                </button>
              </div>
            </form>
          )}

          {/* Comments List */}
          <div className="space-y-4">
            {comments &&
              comments.map((comment) => (
                <div
                  key={comment._id}
                  className="bg-white/5 backdrop-blur-xl rounded-xl p-4 border border-white/10"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-violet-400 font-medium">
                      @{comment.username}
                    </span>
                    <span className="text-gray-400 text-sm">
                      {new Date(comment.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-gray-300">{comment.content}</p>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Background Elements */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-violet-500/10 via-transparent to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-[#030712] to-transparent" />
      </div>
    </div>
  );
};

export default Spot;
