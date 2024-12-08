// hardhat.config.js
require("dotenv").config();
require("@nomiclabs/hardhat-ethers");

module.exports = {
  solidity: "0.8.27",
  networks: {
    aia: {
      url: process.env.AIA_RPC_URL,
      accounts: [process.env.PRIVATE_KEY],
    },
    sepolia: {
      url: "https://linea-sepolia-rpc.publicnode.com",
      accounts: [process.env.PRIVATE_KEY],
    },
    polygon: {
      url: "https://polygon-amoy.blockpi.network/v1/rpc/public",
      accounts: [process.env.PRIVATE_KEY],
    },
    moonbase: {
      url: "https://moonbase-alpha.drpc.org",
      accounts: [process.env.PRIVATE_KEY],
    },
  },
};
