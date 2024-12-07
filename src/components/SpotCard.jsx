import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ThumbsUp, ThumbsDown, MapPin, Award, Star } from "lucide-react";

const SpotCard = ({ spot }) => {
  const navigate = useNavigate();
  const [spotData, setSpotData] = useState(spot);

  const handleCardClick = () => {
    navigate(`/spots/${spot.spotId}`);
  };

  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="bg-black border-2 border-[#8a090a] rounded-md overflow-hidden shadow-[0_0_15px_rgba(138,9,10,0.3)]"
    >
      <div onClick={handleCardClick} className="cursor-pointer">
        {/* Image Section */}
        {spot.photos && spot.photos[0] && (
          <div className="relative h-56">
            <img
              src={spot.photos[0]}
              alt={spot.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/60 to-transparent p-4">
              <h3 className="text-2xl font-bold text-yellow-500">
                {spot.name}
              </h3>
              <div className="flex items-center gap-2 text-white">
                <MapPin className="w-4 h-4" />
                <span>
                  {spot.location.city}, {spot.location.state}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Content Section */}
        <div className="p-6 space-y-4">
          <p className="text-white line-clamp-2">{spot.description}</p>

          {/* Stats Section */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#8a090a]/20 border border-[#8a090a] p-3 rounded-md flex items-center justify-between">
              <ThumbsUp className="w-5 h-5 text-yellow-500" />
              <span className="font-semibold text-white">
                {spotData.upvotes || 0}
              </span>
            </div>
            <div className="bg-[#8a090a]/20 border border-[#8a090a] p-3 rounded-md flex items-center justify-between">
              <ThumbsDown className="w-5 h-5 text-[#8a090a]" />
              <span className="font-semibold text-white">
                {spotData.downvotes || 0}
              </span>
            </div>
          </div>

          {/* Creator Info Section */}
          <div className="bg-[#8a090a]/10 border-2 border-[#8a090a] p-4 rounded-md">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Award className="w-8 h-8 text-yellow-500" />
                <div className="absolute -top-1 -right-1">
                  <div className="flex items-center justify-center w-4 h-4 bg-[#8a090a] rounded-full">
                    <Star className="w-3 h-3 text-yellow-500" />
                  </div>
                </div>
              </div>

              <div className="flex-grow">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-white">
                    Creator Level{" "}
                    <span className="text-yellow-500">
                      {spotData.creatorCredibility?.level || "1"}
                    </span>
                  </p>
                  <div className="h-4 w-px bg-[#8a090a]"></div>
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-medium text-white">
                      Reputation:
                    </span>
                    <div className="flex items-center gap-1 bg-[#8a090a] px-2 py-1 rounded-full">
                      <Star className="w-4 h-4 text-yellow-500" />
                      <span className="text-sm font-bold text-white">
                        {spotData.creatorCredibility?.score || "0"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-2">
                  <div className="w-full h-2 bg-black rounded-full border border-[#8a090a]">
                    <div
                      className="h-full bg-yellow-500 rounded-full transition-all duration-300"
                      style={{
                        width: `\${Math.min(
                          (spotData.creatorCredibility?.score / 100) * 100,
                          100
                        )}%`,
                      }}
                    />
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
