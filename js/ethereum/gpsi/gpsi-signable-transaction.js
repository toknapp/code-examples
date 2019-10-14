//////////////////////////////
// CUSTOM TRANSACTION CLASS //
//////////////////////////////

// The EthereumJS library is easier to convince than Web3 to let Upvest do the
// signing.
const EthJsTransaction = require('ethereumjs-tx').Transaction;

// "Subclass" EthereumJS Transaction to be signable with Upvest GPSI
const UpvestGpsiTransaction = function UpvestGpsiTransaction(data, opts) {
  EthJsTransaction.call(this, data, opts);
};

// Set up prototype chain (i.e. "inheritance")
Object.setPrototypeOf(UpvestGpsiTransaction.prototype, EthJsTransaction.prototype);

// Override EthereumJS's Transaction.sign() method to use Upvest GPSI.
// BEWARE! This method is now `async`, in contrast to the overridden EthJsTransaction.sign().
UpvestGpsiTransaction.prototype.sign = async function (upvestApi, walletId, password) {
  // Utility function to remove "0x" prefix if present
  const un0x = hex => (hex.startsWith('0x') || hex.startsWith('0X')) ? hex.substring(2) : hex;

  // This "clear" step was copy-n-pasted from EthereumJS:
  // We clear any previous signature before signing it. Otherwise,
  // _implementsEIP155() can give different results if this tx was already
  // signed.
  this.r = Buffer.from([]);
  this.s = Buffer.from([]);
  this.v = Buffer.from([]);

  // Get Tx hash as hex string
  const hexMsgHash = this.hash(false).toString('hex');

  // Get signature from Upvest GPSI
  const upvestSig = await upvestApi.signatures.sign(walletId, password, hexMsgHash, 'hex', 'hex');

  // This step was copy-n-pasted from EthereumJS again:
  // Save signature as properties of the Tx, just like it is done in EthJsTransaction.sign()
  this.r = Buffer.from(un0x(upvestSig.r).padStart(64, '0'), 'hex');
  this.s = Buffer.from(un0x(upvestSig.s).padStart(64, '0'), 'hex');
  const ethRecoveryOffset = this._implementsEIP155() ? this.getChainId() * 2 + 35 : 27;
  this.v = Number(upvestSig.recover) + ethRecoveryOffset;
};

module.exports = {
  UpvestGpsiTransaction,
};
