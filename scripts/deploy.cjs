const hre = require("hardhat");

async function main() {
  try {
    // Get the contract factory
    const SecretSpots = await hre.ethers.getContractFactory("SecretSpots");

    // const address = "0x36fD41533d1c86225BDA5FB4E0bC0a8CD22D3180";
    // Deploy the contract
    console.log("Deploying SecretSpots contract...");
    const secretSpots = await SecretSpots.deploy();

    // Wait for deployment to finish
    const contractAddress = await secretSpots.address;

    console.log("SecretSpots contract deployed to:", contractAddress);
    console.log("Save this address for interaction script!");
  } catch (error) {
    console.error("Error during deployment:", error);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
