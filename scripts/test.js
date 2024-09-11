const hre = require("hardhat");

const ACCOUNT_ADDR = "0xb0a8cc58cd5ab6f48003909138e49f38ff4a429d";

async function main() {
  const account = await hre.ethers.getContractAt("Account", ACCOUNT_ADDR);
  const count = await account.count();
  console.log(count);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
