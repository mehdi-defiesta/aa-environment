const hre = require("hardhat");

const FACTORY_ADDRESS = "0x8542e86550F497b84350630fF23D2815c8Ce5928";
const EP_ADDRESS = "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789";
const PM_ADDRESS = "0xbb7187A1990007578d791BDEFefe7d821fEb045B";

async function main() {
  const entryPoint = await hre.ethers.getContractAt("EntryPoint", EP_ADDRESS);

  const AccountFactory = await hre.ethers.getContractFactory("AccountFactory");
  const [signer0, signer1] = await hre.ethers.getSigners();
  const address0 = await signer0.getAddress();
  
  /*
  We call createAccount function from the accountFactory contract in order to create a smart account
  The function returns the already deployed contract address if the caller has already created his smart acount
  */ 
  let initCode =
    FACTORY_ADDRESS +
    AccountFactory.interface
      .encodeFunctionData("createAccount", [address0])
      .slice(2);

  let sender;
  try {
    await entryPoint.getSenderAddress(initCode);
  } catch (ex) {
    sender = "0x" + ex.data.slice(-40);
  }

  const code = await ethers.provider.getCode(sender);
  if (code !== "0x") {
    initCode = "0x";
  }

  console.log({ sender });

  /* 
  Implementation of a userOperation. Nonce is managed by fetching the nonce if the smart account
  we call execute function which is going to increment the `count` storage variable.
  the signature is by default for now. See below how it is implemented.
  */
  const Account = await hre.ethers.getContractFactory("Account");
  const userOp = {
    sender, // smart account address
    nonce: "0x" + (await entryPoint.getNonce(sender, 0)).toString(16),
    initCode,
    callData: Account.interface.encodeFunctionData("execute"),
    paymasterAndData: PM_ADDRESS,
    signature:
      "0xfffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c",
  };


  /*
  We call eth_estimateUserOperationGas which is included in the bundler API endpoint.
  It calculates the preVerificationGas, verificationGasLimit and the callGasLimit which is going to be used
  by the endpoint to manage the paymaster contract. 
  */

  const { preVerificationGas, verificationGasLimit, callGasLimit } =
    await ethers.provider.send("eth_estimateUserOperationGas", [
      userOp,
      EP_ADDRESS,
    ]);

  userOp.preVerificationGas = preVerificationGas;
  userOp.verificationGasLimit = verificationGasLimit;
  userOp.callGasLimit = callGasLimit;


  const { maxFeePerGas } = await ethers.provider.getFeeData();
  userOp.maxFeePerGas = "0x" + maxFeePerGas.toString(16);

  const maxPriorityFeePerGas = await ethers.provider.send(
    "rundler_maxPriorityFeePerGas"
  );
  userOp.maxPriorityFeePerGas = maxPriorityFeePerGas;

  const userOpHash = await entryPoint.getUserOpHash(userOp);
  userOp.signature = await signer0.signMessage(hre.ethers.getBytes(userOpHash));

  /*
  low-level method used to send JSON-RPC requests directly to the bundler. 
  It does not involve signing transactions or using a private key. 
  Instead, it sends raw requests to the bundler
  */ 
  const opHash = await ethers.provider.send("eth_sendUserOperation", [
    userOp,
    EP_ADDRESS,
  ]);

  console.log({opHash});

  setTimeout(async () => {
    const { transactionHash } = await ethers.provider.send(
      "eth_getUserOperationByHash",
      [opHash]
    );

    console.log(transactionHash);
  }, 30000);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});