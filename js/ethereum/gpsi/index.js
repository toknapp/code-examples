// CODE EXAMPLE: Upvest GPSI (General Purpose Signing Interface) for Ethereum

/////////////////////
// LIBRARY IMPORTS //
/////////////////////

// Here, the Web3 library is mostly used to communicate with the actual
// blockchain.
const Web3 = require('web3');

// Ethereum has 256 bit ints, so we need an arbitrary-precision arithmetic
// library to handle those. (JS only has 53 bits precision inside of 64 bit
// floats.)
// See https://en.wikipedia.org/wiki/Arbitrary-precision_arithmetic
const { toBN } = require('web3-utils');

// Upvest's GPSI is currently wrapped by the Upvest Clientele API.
const { UpvestClienteleAPI } = require('@upvest/clientele-api');

// Upvest's subclass of EthereumJS's Transaction class.
const { UpvestGpsiTransaction } = require('./gpsi-signable-transaction.js');

// Helper functions.
const { inspect, readConfig } = require('./util.js');

///////////////
// MAIN CODE //
///////////////

// Wrap this code in `async` function merely to allow `await` expressions.
async function main() {
  // Read configuration with access credentials etc.
  // See ./example-config-documented.js and ./example-config-*.json
  let cfg;
  try {
    cfg = readConfig();
  }
  catch (err) {
    console.log(err.message);
    return;
  };

  // Connect to the Ethereum blockchain via Web3 and Infura.
  const web3ProviderUrl = `wss://${cfg.netName}.infura.io/ws/v3/${cfg.infuraProjectId}`;
  const web3Provider = new Web3.providers.WebsocketProvider(web3ProviderUrl);
  const web3 = new Web3(web3Provider);

  // Configure the Upvest API client.
  const upvestClienteleApi = new UpvestClienteleAPI(
    cfg.upvest.baseUrl,
    cfg.upvest.OAuth2ClientId,
    cfg.upvest.OAuth2ClientSecret,
    cfg.upvest.username,
    cfg.upvest.password,
    cfg.upvest.OAuth2Scopes,
    cfg.upvest.timeout,
  );

  // Prepare the parameters for the EthereumJS Transaction object, and in turn
  // for our subclass `UpvestGpsiTransaction`.
  const rawTx = {};

  // Process config to call a function on a smart contract.
  if (cfg.contract) {
    // Prepare smart contract function call as binary transaction payload.
    rawTx.data = web3.eth.abi.encodeFunctionCall(cfg.contract.functionAbi, cfg.contract.callParameters);
    rawTx.value = '0x00';
    rawTx.to = cfg.contract.address;
  }

  // Process config to send Ether.
  if (cfg.ether) {
    rawTx.data = '0x'; // "0x" means an empty byte string.
    rawTx.value = toBN(cfg.ether.value);
    rawTx.to = cfg.ether.recipientAddress;
  }

  // Get the current nonce for the sending wallet.
  const nonce = await web3.eth.getTransactionCount(cfg.upvest.walletAddress);

  // Add "administrative" transaction data.
  Object.assign(rawTx, {
    nonce: toBN(nonce),
    gasPrice: toBN(cfg.gasPrice),
    gasLimit: toBN(cfg.gasLimit),
  });

  // Create an actual Transaction object from our subclass.
  const tx = new UpvestGpsiTransaction(rawTx, {chain: cfg.netName});

  // Use the overridden `sign()` method which calls the Upvest API's "GPSI",
  // i.e. General Purpose Signing Interface.
  await tx.sign(upvestClienteleApi, cfg.upvest.walletId, cfg.upvest.password);

  // Create binary representation of the transaction.
  const serializedTx = tx.serialize();

  // Broadcast transaction to the Ethereum blockchain via Infura.
  const txPromise = web3.eth.sendSignedTransaction('0x' + serializedTx.toString('hex'));

  // Output transaction hash as Etherscan link for easier manual monitoring.
  txPromise.once('transactionHash', txHash => inspect(`https://${cfg.netName}.etherscan.io/tx/${txHash}`));

  // Hold up main control flow until we've received a transaction receipt or an error.
  try {
    const receipt = await new Promise(function receiptPromiseExecutor(resolveReceiptPromise, rejectReceiptPromise) {
      txPromise.once('receipt', receipt => resolveReceiptPromise(receipt));
      txPromise.on('error', err => rejectReceiptPromise(err));
    });
    inspect('receipt:', receipt);
    // Also display the full transaction in addition to the receipt.
    inspect('transaction:', await web3.eth.getTransaction(receipt.transactionHash));
  }
  catch (err) {
    inspect('error:', err);
  }

  // Disconnect from Web3 provider to allow node process to terminate.
  if (web3.currentProvider) {
    web3.currentProvider.disconnect();
  }
}

// Execute the `async` wrapper function.
main();
