# Account abstraction environment

## steps

- fill the .env with the PRIVATE_KEY and the RPC_URL
- run the deploy script `npx hardhat run scripts/deploy.js`
- fill in the deposit script with the PM address. Note that the Entry point must not be modified (already deployed by alchemy).
- run the deposit script `npx hardhat run scripts/deposit.js` (ensure to have at least 0.2 ETH available)
- fill the execute file with the AF and PM addresses. Note that the Entry point must not be modified (already deployed by alchemy).
- run the execute script `npx hardhat run scripts/execute.js`

You've made it right if you pass another private key and the count variable is reset to 0 when you first recall execute script (run the test script to verify `npx hardhat run scripts/test.js`). 