import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { WalletProvider } from "./contexts/WalletContext";
import { SecretSpotsProvider } from "./contexts/SecretSpotsContext";
import Navbar from "./components/Navbar";
import Home from "./components/Home";
import Spots from "./components/Spots";
import Spot from "./components/Spot";
import Profile from "./components/Profile";

function App() {
  return (
    <Router>
      <WalletProvider>
        <SecretSpotsProvider>
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/spots" element={<Spots />} />
            <Route path="/spots/:spotId" element={<Spot />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </SecretSpotsProvider>
      </WalletProvider>
    </Router>
  );
}

export default App;
