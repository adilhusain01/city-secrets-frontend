import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ThumbsUp, ThumbsDown, MapPin, Award, Star } from "lucide-react";

const SpotCard = ({ spot }) => {
  const navigate = useNavigate();
  const [spotData] = useState(spot);

  const handleCardClick = () => {
    navigate(`/spots/${spot.spotId}`);
  };

  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="relative overflow-hidden rounded-lg bg-gray-900/90 border border-yellow-500/20 hover:shadow-yellow-500/10 hover:shadow-lg transition-all duration-300"
    >
      <div onClick={handleCardClick} className="cursor-pointer">
        {/* Image and Header Section */}
        {spot.photos?.[0] && (
          <div className="relative aspect-video">
            <img
              src={spot.photos[0]}
              alt={spot.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <h3 className="text-xl font-semibold text-white mb-1">
                {spot.name}
              </h3>
              <div className="flex items-center gap-1.5 text-gray-200 text-sm">
                <MapPin className="w-4 h-4" />
                <span>{`${spot.location.city}, ${spot.location.state}`}</span>
              </div>
            </div>
          </div>
        )}

        {/* Content Section */}
        <div className="p-4 space-y-4">
          {/* Description */}
          <p className="text-gray-300 text-sm line-clamp-2">
            {spot.description}
          </p>

          {/* Voting Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-gray-800/50 border border-gray-700">
              <div className="flex items-center gap-2">
                <ThumbsUp className="w-4 h-4 text-green-500" />
                <span className="text-sm font-medium text-gray-200">
                  Upvotes
                </span>
              </div>
              <span className="font-semibold text-white">
                {spotData.upvotes || 0}
              </span>
            </div>
            <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-gray-800/50 border border-gray-700">
              <div className="flex items-center gap-2">
                <ThumbsDown className="w-4 h-4 text-red-500" />
                <span className="text-sm font-medium text-gray-200">
                  Downvotes
                </span>
              </div>
              <span className="font-semibold text-white">
                {spotData.downvotes || 0}
              </span>
            </div>
          </div>

          {/* Creator Info */}
          <div className="rounded-lg bg-gray-800/50 border border-gray-700 p-3">
            <div className="flex items-center gap-3">
              <div className="relative flex-shrink-0">
                <div className="p-2 bg-gray-700 rounded-lg">
                  <Award className="w-6 h-6 text-yellow-500" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center">
                  <Star className="w-3 h-3 text-gray-900" />
                </div>
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-sm text-gray-300">
                    Level{" "}
                    <span className="text-yellow-500 font-semibold">
                      {spotData.creatorCredibility?.level || "1"}
                    </span>
                  </span>
                  <div className="h-4 w-px bg-gray-700" />
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-300">Rep</span>
                    <div className="px-2 py-0.5 rounded-full bg-gray-700 flex items-center gap-1">
                      <Star className="w-3 h-3 text-yellow-500" />
                      <span className="text-sm font-medium text-white">
                        {spotData.creatorCredibility?.score || "0"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default SpotCard;
