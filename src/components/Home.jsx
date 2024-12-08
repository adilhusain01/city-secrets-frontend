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
        className="w-full px-[12.5rem] py-24 relative z-10"
      >
        <div className="grid grid-cols-2 items-justify-center gap-20 min-h-[calc(100vh-160px)]">
          <motion.div
            variants={itemVariants}
            className="flex flex-col item-center  justify-center space-y-16"
          >
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent leading-tight">
              Share the things you love the most. <br />
              <span className="text-[#8a090a]">You'll make someone's day.</span>
            </h1>

            <p className="text-gray-300 text-lg md:text-xl leading-relaxed">
              Discover or Share underrated spots in your locality. Connect with
              like-minded explorers.
            </p>

            <Link to={"/spots"}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                onClick={connectWallet}
                className="w-fit bg-gradient-to-r from-yellow-400 to-yellow-600 text-black px-8 py-4 rounded-lg flex items-center gap-3 text-lg font-semibold shadow-xl hover:shadow-yellow-500/20 transition-all"
              >
                <MapPin className="w-5 h-5" />
                Start Your Adventure
                <ArrowRight className="w-5 h-5" />
              </motion.button>
            </Link>
          </motion.div>

          <AnimatedBackground />
        </div>
      </motion.div>
    </div>
  );
};

export default Home;
