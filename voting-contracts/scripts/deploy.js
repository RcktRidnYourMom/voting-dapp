const { ethers } = require("hardhat");

async function main() {
  const [deployer, testAccount] = await ethers.getSigners();
  console.log("Deploying contracts with:", deployer.address);

  // Deploy UomiToken
  const Token = await ethers.getContractFactory("UomiToken");
  const uomiToken = await Token.deploy();
  await uomiToken.deploymentTransaction().wait();
  const tokenAddress = await uomiToken.getAddress();
  console.log("UomiToken deployed at:", tokenAddress);

  // Deploy UomiDAO with the token address
  const DAO = await ethers.getContractFactory("UomiDAO");
  const dao = await DAO.deploy(tokenAddress);
  await dao.deploymentTransaction().wait();
  const daoAddress = await dao.getAddress();
  console.log("UomiDAO deployed at:", daoAddress);

  // Optional: transfer some tokens to another account
  const tx = await uomiToken.transfer(testAccount.address, ethers.parseEther("1000"));
  await tx.wait();
  console.log("Transferred 1000 UOMI to:", testAccount.address);
}

main().catch((error) => {
  console.error("Deployment failed:", error);
  process.exit(1);
});
