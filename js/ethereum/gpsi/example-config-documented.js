//////////////////////////////////////
// DOCUMENTED EXAMPLE CONFIGURATION //
//////////////////////////////////////

// This is not a JSON file for the sake of having nice comments.

const exampleConfig = {
  // Which blockchain network we are working with. One of "mainnet", "ropsten",
  // "kovan", "rinkeby", "goerli" etc.
  netName: "ropsten",

  // We use https://infura.io/ to query the blockchain state and to broadcast to
  // the blockchain. Infura requires us to identify ourselves with this ID.
  infuraProjectId: "0123456789abcdef0123456789abcdef",

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
    // function.
    address: "0x123456789abcdef0123456789abcdef012345678",

    // The ABI of the function which is to be called on the above smart
    // contract. For this simple example, we chose the well-known `transfer(_to,
    // _value)` function of an ERC20 contract. Of course this can be any other
    // function of that contract for which you know the ABI.
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

  ether: {
    value: 0.0001 * 1e18,
    recipientAddress: "0x3456789abcdef0123456789abcdef0123456789a",
  },

  // How much gas we are willing to use up.
  gasLimit: 60000,

  // How many `wei` we are willing to pay per `gas` unit.
  gasPrice: 3.5 * 1e9
};


module.exports = {
  exampleConfig,
};
