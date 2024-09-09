const hre = require("hardhat");

const ACCOUNT_ADDR = "0x73df168ac23305b4d4ccaaa70693985bc097b91e";

async function main() {
  const account = await hre.ethers.getContractAt("Account", ACCOUNT_ADDR);
  const count = await account.count();
  console.log(count);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
