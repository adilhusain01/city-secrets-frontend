import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSecretSpots } from "../contexts/SecretSpotsContext";
import SpotCard from "./SpotCard";
import CreateSpot from "./CreateSpot";
import { Search, Plus, Loader, MapPin, X, User } from "lucide-react";

const Spots = () => {
  const {
    spots,
    loading,
    fetchSpots,
    fetchSpotsByCity,
    contractError,
    isRegisteredUser,
    registerUser,
  } = useSecretSpots();
  const [searchCity, setSearchCity] = useState("");
  const [error, setError] = useState(null);
  const [filteredSpots, setFilteredSpots] = useState([]);
  const [showCreateSpot, setShowCreateSpot] = useState(false);

  const [username, setUsername] = useState("");
  const [registrationLoading, setRegistrationLoading] = useState(false);

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

  useEffect(() => {
    fetchSpots();
  }, []);

  useEffect(() => {
    if (spots.length > 0) {
      const sorted = [...spots].sort((a, b) => b.upvotes - a.upvotes);
      setFilteredSpots(sorted);
    }
  }, [spots]);

  const handleSearch = async () => {
    try {
      setError(null);
      if (!searchCity.trim()) {
        setError("Please enter a city name");
        return;
      }
      await fetchSpotsByCity(searchCity);
    } catch (err) {
      setError(err.message || "Failed to search spots");
    }
  };

  const handleRegister = async () => {
    if (!username.trim()) {
      setError("Please enter a username");
      return;
    }

    try {
      setRegistrationLoading(true);
      await registerUser(username);
      setUsername("");
      setError(null);
    } catch (err) {
      setError(err.message || "Registration failed");
    } finally {
      setRegistrationLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-black to-gray-900">
        {" "}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-[#8a090a] border-t-yellow-500 rounded-full"
        />{" "}
      </div>
    );
  }

  // Contract Error Screen
  if (contractError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-black to-gray-900">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-black border-2 border-[#8a090a] p-8 rounded-md shadow-[0_0_15px_rgba(138,9,10,0.3)] text-center max-w-xl mx-4"
        >
          <h2 className="text-2xl font-bold text-yellow-500 mb-4">Error</h2>
          <p className="text-white">{contractError}</p>
        </motion.div>{" "}
      </div>
    );
  }

  // Registration Screen
  if (!isRegisteredUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-black to-gray-900">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-black border-2 border-[#8a090a] p-8 rounded-md shadow-[0_0_15px_rgba(138,9,10,0.3)] max-w-md w-full mx-4"
        >
          <h2 className="text-3xl font-bold text-yellow-500 mb-6 text-center">
            {" "}
            Welcome to City Secrets{" "}
          </h2>

          <div className="space-y-4">
            <div className="relative">
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
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
                <User className="w-5 h-5" />
              )}
              {registrationLoading ? "Registering..." : "Create Account"}
            </motion.button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Main Content
  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-gray-900 flex flex-col gap-[2rem]">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full mx-auto px-[12.5rem] py-32 relative z-10"
      >
        {/* Header Section */}{" "}
        <motion.div
          variants={itemVariants}
          className="flex flex-col md:flex-row gap-6 items-center justify-between"
        >
          <h2 className="text-4xl font-bold text-yellow-500">Discover Spots</h2>

          <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
            <div className="relative">
              <input
                type="text"
                value={searchCity}
                onChange={(e) => setSearchCity(e.target.value)}
                placeholder="Search by city..."
                className="w-full md:w-80 px-6 py-4 rounded-md bg-black border-2 border-[#8a090a] focus:outline-none focus:border-yellow-500 text-white placeholder-gray-500"
              />
              <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[#8a090a]" />
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSearch}
              disabled={loading}
              className="px-6 py-4 rounded-md bg-[#8a090a] text-white font-semibold flex items-center justify-center gap-2 hover:bg-[#a01011] transition-all border-2 border-[#8a090a]"
            >
              {loading ? <Loader className="animate-spin" /> : <MapPin />}
              {loading ? "Searching..." : "Search"}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowCreateSpot(true)}
              className="px-6 py-4 rounded-md bg-[#8a090a] text-white font-semibold flex items-center justify-center gap-2 hover:bg-[#a01011] transition-all border-2 border-[#8a090a]"
            >
              <Plus />
              Create Spot
            </motion.button>
          </div>
        </motion.div>
        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-[#8a090a]/20 border-2 border-[#8a090a] px-6 py-4 rounded-md text-white flex items-center justify-between"
            >
              <span>{error}</span>
              <button
                onClick={() => setError(null)}
                className="text-white hover:text-yellow-500 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
        {/* Spots Grid or Empty State */}
        {loading ? (
          <div className="min-h-[40vh] flex justify-center items-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-16 h-16 border-4 border-[#8a090a] border-t-yellow-500 rounded-full"
            />
          </div>
        ) : filteredSpots.length > 0 ? (
          <motion.div
            variants={containerVariants}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 py-12"
          >
            {filteredSpots.map((spot) => (
              <motion.div key={spot.spotId} variants={itemVariants}>
                <SpotCard spot={spot} />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            variants={itemVariants}
            className="min-h-[40vh] flex items-center justify-center"
          >
            <div className="text-center bg-black border-2 border-[#8a090a] p-8 rounded-md shadow-[0_0_15px_rgba(138,9,10,0.3)]">
              <p className="text-xl text-white">
                No spots found. Be the first to create one!
              </p>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Create Spot Modal */}
      <AnimatePresence>
        {showCreateSpot && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-10 flex justify-center items-center p-4"
            onClick={() => setShowCreateSpot(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-black border-2 border-[#8a090a] rounded-md max-w-2xl w-full overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <CreateSpot onClose={() => setShowCreateSpot(false)} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Spots;
