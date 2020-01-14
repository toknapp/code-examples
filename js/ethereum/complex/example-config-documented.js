//////////////////////////////////////
// DOCUMENTED EXAMPLE CONFIGURATION //
//////////////////////////////////////

// This is not a JSON file for the sake of having nice comments.

const exampleConfig = {
  upvest: {
    // Upvest API credentials.
    baseUrl: "https://api.playground.upvest.co/1.0/",
    timeout: 60000,
    OAuth2ClientId: "randomCHARSrandomCHARSrandomCHARSrandom4",
    OAuth2ClientSecret: "randomCHARSrandomCHARSrandomCHARSrandomCHARSrandomCHARSrandomCHARSrandomCHARSrandomCHARSrandomCHARSrandomCHARSrandomCHARSrandom4",
    OAuth2Scopes: ["read", "write", "echo", "wallet", "transaction"],

    // Credentials of the Upvest-managed wallet with which we will sign a
    // transaction.
    username: "EXAMPLE_USERNAME",
    password: "EXAMPLE_PASSWORD",
    walletId: "01234567-0123-4567-0123-0123456789ab",
    walletAddress: "0x0123456789abcdef0123456789abcdef01234567"
  },

  contract: {
    // The Ethereum address of the smart contract on which we will call a
    // function. Formatted as hex string with leading "0x" prefix.
    address: "0x123456789abcdef0123456789abcdef012345678",


    // The ABI of the function which is to be called on the above smart
    // contract.
    //
    // A JSON object describing how exactly to call this function. Includes the
    // function name and the type(s) of the call parameter(s).
    //
    // See also https://solidity.readthedocs.io/en/latest/abi-spec.html
    //
    // BEWARE: Since we are calling only one function here, you have to include
    // only the ABI of that specific function, *not* the ABI of the whole
    // contract (which usually is a JSON array).
    //
    // For this simple example, we chose the well-known `transfer(_to, _value)`
    // function of an ERC20 contract. Of course this can be any other function
    // of that contract for which you know the ABI.
    functionAbi: {
      "constant": false,
      "inputs": [{"name": "_to", "type": "address"}, {"name": "_value", "type": "uint256"}],
      "name": "transfer",
      "outputs": [{"name": "", "type": "bool"}],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "function"
    },

    callParameters: [
      // The 1st parameter for the above function call happens to be an address
      // to transfer ERC20 tokens to.
      "0x23456789abcdef0123456789abcdef0123456789",

      // The 2st parameter for the above function call happens to be the amount
      // of ERC20 tokens to transfer to the recipient.
      "1",
    ]
  },

  // If necessary for a `payable` function, some Ether can be sent along with
  // the function call. Leave at `0` for `nonpayable` functions.
  //
  // Upvest advocates sending this as a base-10 encoded string representation
  // instead of the actual integer, since Ethereum integers have 256 bits, and
  // there are only 53 significant bits inside JSON 64-bit Numbers.
  value: 0.0001 * 1e18,

  // The maximum amount of gas you are willing to spend for this transaction.
  //
  // See also https://ethgasstation.info/blog/gas-limit/
  //
  // Upvest advocates sending this as a base-10 encoded string representation
  // instead of the actual integer, since Ethereum integers have 256 bits, and
  // there are only 53 significant bits inside JSON 64-bit Numbers.
  gasLimit: 60000,

  // The price you are willing to pay per gas "unit". This determines the
  // likelyhood with which miners will choose to include this transaction in one
  // of the next blocks.
  //
  // BEWARE: Elsewhere on the Internet, you might find current gas prices quoted
  // in Gwei, but at Upvest, all Ether quantities, including gas price, are
  // measured in *Wei*, *not* in Gwei!
  //
  // Upvest advocates sending this as a base-10 encoded string representation
  // instead of the actual integer, since Ethereum integers have 256 bits, and
  // there are only 53 significant bits inside JSON 64-bit Numbers.
  gasPrice: 3.5 * 1e9,

  // Configure the polling for a transaction hash.
  pollingForTxHash: {
    maxTotalSeconds: 480,
    maxIntervalSeconds: 30,
    initialIntervalSeconds: 1,
    backOffFactor: 2
  }
};


module.exports = {
  exampleConfig,
};
