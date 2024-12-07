import { motion } from "framer-motion";
import { useWallet } from "../contexts/WalletContext";
import { MapPin, Users, Award, Compass, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import AnimatedBackground from "./AnimatedBackground";
import { useEffect } from "react";

const Home = () => {
  const { account, connectWallet } = useWallet();

  useEffect(() => {
    connectWallet();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.3 },
    },
  };

  const itemVariants = {
    hidden: { y: 40, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 50 },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-gray-900">
      {/* <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10" /> */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10"
      >
        <div className="flex flex-col lg:flex-row items-center justify-between gap-16 min-h-[calc(100vh-160px)]">
          <motion.div variants={itemVariants} className="flex-1 space-y-10">
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent leading-tight">
              Share the things you love the most. You'll make someone's day.
            </h1>

            <p className="text-gray-300 text-lg md:text-xl leading-relaxed">
              Discover and share hidden gems in your community. Connect with
              like-minded explorers.
            </p>

            <div className="grid md:grid-cols-2 gap-6">
              <motion.div
                whileHover={{ y: -8, scale: 1.02 }}
                className="bg-gray-900/50 backdrop-blur-sm border border-yellow-500/20 p-8 rounded-xl hover:shadow-yellow-500/10 hover:shadow-lg transition-all duration-300"
              >
                <Link to="/spots" className="space-y-4">
                  <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 p-4 rounded-lg w-fit">
                    <Compass className="w-6 h-6 text-black" />
                  </div>
                  <h3 className="text-xl font-semibold text-yellow-400">
                    Explore
                  </h3>
                  <p className="text-gray-300">
                    Find secret locations and unique experiences near you
                  </p>
                </Link>
              </motion.div>
            </div>

            {!account && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                onClick={connectWallet}
                className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black px-8 py-4 rounded-lg flex items-center gap-3 text-lg font-semibold shadow-xl hover:shadow-yellow-500/20 transition-all"
              >
                <MapPin className="w-5 h-5" />
                Start Your Adventure
                <ArrowRight className="w-5 h-5" />
              </motion.button>
            )}
          </motion.div>

          <div variants={itemVariants} className="flex-1">
            <AnimatedBackground />
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Home;
