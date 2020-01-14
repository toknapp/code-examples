// CODE EXAMPLE: Upvest API for "complex" Ethereum transactions


/////////////////////
// LIBRARY IMPORTS //
/////////////////////

// Ethereum has 256 bit ints, so we need an arbitrary-precision arithmetic
// library to handle those. (JS only has 53 bits precision inside of 64 bit
// floats.)
// See https://en.wikipedia.org/wiki/Arbitrary-precision_arithmetic
const { toBN } = require('web3-utils');

// Upvest's GPSI is currently wrapped by the Upvest Clientele API.
const { UpvestClienteleAPI } = require('@upvest/clientele-api');

// Helper functions.
const { setTimeoutPromise, inspect, readConfig } = require('./util.js');


///////////////
// MAIN CODE //
///////////////

// Wrap this code in an `async` function merely to allow `await` expressions.
async function main() {


  ///////////
  // SETUP //
  ///////////

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


  //////////////////////
  // SEND TRANSACTION //
  //////////////////////

  // Prepare "complex" transaction payload.
  const tx = {

    // Tell the Upvest API which kind of "complex" transaction you want to send.
    type: 'ethereum_function_call',

    // The Ethereum address of the smart contract on which we will call a
    // function. Formatted as hex string with leading "0x" prefix.
    to: cfg.contract.address,

    // If necessary for a `payable` function, some Ether can be sent along with
    // the function call. Leave at `0` for `nonpayable` functions.
    //
    // Upvest advocates sending this as a base-10 encoded string representation
    // instead of the actual integer, since Ethereum integers have 256 bits, and
    // there are only 53 significant bits inside JSON 64-bit Numbers.
    value: toBN(cfg.value).toString(10),

    // The maximum amount of gas you are willing to spend for this
    // transaction.
    //
    // See also https://ethgasstation.info/blog/gas-limit/
    //
    // Upvest advocates sending this as a base-10 encoded string representation
    // instead of the actual integer, since Ethereum integers have 256 bits, and
    // there are only 53 significant bits inside JSON 64-bit Numbers.
    gas_limit: toBN(cfg.gasLimit).toString(10),

    // The price you are willing to pay per gas "unit". This determines the
    // likelyhood with which miners will choose to include this transaction in
    // one of the next blocks.
    //
    // BEWARE: Elsewhere on the Internet, you might find current gas prices
    // quoted in Gwei, but at Upvest, all Ether quantities, including gas price,
    // are measured in *Wei*, *not* in Gwei!
    //
    // Upvest advocates sending this as a base-10 encoded string representation
    // instead of the actual integer, since Ethereum integers have 256 bits, and
    // there are only 53 significant bits inside JSON 64-bit Numbers.
    gas_price: toBN(cfg.gasPrice).toString(10),

    // A JSON object describing how exactly to call this function. Includes the
    // function name and the type(s) of the call parameter(s).
    //
    // See also https://solidity.readthedocs.io/en/latest/abi-spec.html
    //
    // BEWARE: Since we are calling only one function here, you have to include
    // only the ABI of that specific function, *not* the ABI of the whole
    // contract (which usually is a JSON array).
    abi: cfg.contract.functionAbi,

    // A JSON array listing all values to be used, for each call parameter.
    //
    // This list has to match with the list of types in the `abi` field.
    //
    // Any integer values are welcome to be sent as base-10 string
    // representations, to get around the limit of only 53 significant bits
    // inside JSON 64-bit Numbers.
    parameters: cfg.contract.callParameters
  }

  // Decide whether the auxilliary Upvest funding service should cover the
  // transaction fee. If so chosen, the funding amount will be the product of
  // gas limit times gas price.
  const fund = true;

  // Sign and broadcast the transaction to the Ethereum blockchain via Upvest.
  let sendResult;
  try {
    sendResult = await upvestClienteleApi.transactions.createComplex(
      cfg.upvest.walletId,
      cfg.upvest.password,
      tx,
      fund,
    );
  }
  catch (err) {
    console.log(err.message);
    return;
  }

  inspect(sendResult);


  //////////////////////////////////////////
  // POLL UPVEST API FOR TRANSACTION HASH //
  //////////////////////////////////////////

  // Upvest advocates using webhooks instead of polling, but I want to keep this
  // example simple.

  const pollingMaxTotalTime = cfg.pollingForTxHash.maxTotalTimeSeconds || 480;
  const pollingMaxInterval = cfg.pollingForTxHash.maxIntervalSeconds || 30;
  const pollingBackOffFactor = cfg.pollingForTxHash.backOffFactor || 2;
  let pollingInterval = cfg.pollingForTxHash.initialIntervalSeconds || 1;
  let pollingTotalTime = 0;
  let hasHash = false;
  while (!hasHash && pollingTotalTime < pollingMaxTotalTime) {
    console.log(`Polling for transaction hash.`)
    const retrievedTx = await upvestClienteleApi.transactions.retrieve(cfg.upvest.walletId, sendResult.id);
    if (retrievedTx.txhash) {
      hasHash = true;
      inspect(retrievedTx);
    }
    else {
      console.log(`Wait for another ${pollingInterval} seconds until polling again.`);
      console.log(`(Waited for ${pollingTotalTime} seconds in total. Timing out at ${pollingMaxTotalTime} seconds.)`);
      await setTimeoutPromise(pollingInterval * 1000);
      pollingTotalTime += pollingInterval;
      pollingInterval = Math.min(pollingInterval * pollingBackOffFactor, pollingMaxInterval);
    }
  }
}

// Execute the `async` wrapper function.
main();
