const hre = require("hardhat");

async function main() {
  // Deploy AccountFactory contract
  const af = await hre.ethers.deployContract("AccountFactory");
  await af.waitForDeployment();
  console.log(`AF deployed to ${af.target}`);

  // Deploy Paymaster contract
  const pm = await hre.ethers.deployContract("Paymaster");
  await pm.waitForDeployment();
  console.log(`PM deployed to ${pm.target}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
