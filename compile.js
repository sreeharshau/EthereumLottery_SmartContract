// Require relevant modules
const path = require('path');
const fs = require('fs');
const solc = require('solc');

// We use path.resolve here to make it platform independent i.e Linux vs Windows
const contractPath = path.resolve(__dirname, 'contracts', 'Lottery.sol');

// We need to pass the source code directly to the compiler so we read it in using fs.readFileSync
const sourceCode = fs.readFileSync(contractPath, 'utf8');


// Exports the compiled code for this contract specifically
// Contains parameters named 'interface' and 'bytecode' for the ABI and Byte code respectively
output = JSON.parse(solc.compile(JSON.stringify({
  language: 'Solidity',
  sources: {
    'Lottery.sol': {
      content: sourceCode,
    },
  },
  settings: {
    outputSelection: {
      '*': {
        '*': ['*'],
      },
    },
  },
})));

// Export bytecode and ABI for use by other modules
module.exports.bytecode = output.contracts['Lottery.sol']["Lottery"].evm.bytecode.object;
module.exports.interface = output.contracts['Lottery.sol']["Lottery"].abi;



