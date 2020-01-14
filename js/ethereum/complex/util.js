///////////////////////
// UTILITY FUNCTIONS //
///////////////////////

const { resolve } = require('path');

const util = require('util');
const setTimeoutPromise = util.promisify(setTimeout);

// Print without depth limit.
const inspect = (...things) => things.forEach(thing => console.dir(thing, {depth:null, colors:true}));

// Read a JSON config file given as the last parameter of the command line.
const readConfig = () => {
  const mainScript = resolve(require.main.filename);
  const lastArg = resolve(process.argv.pop());

  if (lastArg == mainScript) {
    throw Error('Please specify a JSON config file as the last command line parameter!');
  }

  let cfgModuleFilename;
  try {
    cfgModuleFilename = require.resolve(lastArg);
  }
  catch (err) {
    throw Error(`Unable to find the JSON config file: ${lastArg}`);
  }

  const cfg = require(cfgModuleFilename);

  if (cfg.contract && cfg.ether) {
    throw Error('Creating transactions with both, transaction data *and* Ether value, is beyond the scope of this code example.');
  }

  if (! cfg.contract && ! cfg.ether) {
    throw Error('Either `cfg.contract` or `cfg.ether` have to be specified.');
  }

  return cfg;
}

module.exports = {
  setTimeoutPromise,
  inspect,
  readConfig,
};
