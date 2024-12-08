import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useWallet } from "../contexts/WalletContext";
import { Wallet, Sparkles, User } from "lucide-react";
import { Link } from "react-router-dom";
import logo from "../assets/logo.png";

const Navbar = () => {
  const { account, connectWallet } = useWallet();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className={`fixed w-full z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-black/80 backdrop-blur-md border-b border-yellow-800"
          : "bg-transparent"
      }`}
    >
      <div className="w-full mx-auto px-[12.5rem]">
        <div className="flex justify-between items-center h-20">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="flex items-center"
          >
            <Link to="/" className="flex items-center gap-2">
              <img src={logo} alt="logo" className="h-12 w-auto" />
            </Link>
          </motion.div>

          <div className="flex items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={connectWallet}
              className="bg-gray-900 text-yellow-400 px-6 py-2 rounded-lg flex items-center gap-2 border border-yellow-500/20 hover:border-yellow-500/40 transition-all"
            >
              <Wallet className="w-4 h-4" />
              <span>
                {account
                  ? `${account.slice(0, 6)}...${account.slice(-4)}`
                  : "Connect"}
              </span>
            </motion.button>

            <Link to="/profile">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="bg-yellow-400 text-black px-6 py-2 rounded-lg flex items-center gap-2 hover:bg-yellow-500 transition-all"
              >
                <User className="w-4 h-4" />
                Profile
              </motion.button>
            </Link>
          </div>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
