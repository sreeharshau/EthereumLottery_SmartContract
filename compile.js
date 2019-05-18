// Require relevant modules
const path = require('path');
const fs = require('fs');
const solc = require('solc');

// We use path.resolve here to make it platform independent i.e Linux vs Windows
const inboxPath = path.resolve(__dirname, 'contracts', 'Inbox.sol');

// We need to pass the source code directly to the compiler so we read it in using fs.readFileSync
// Could probably use fs.readFile with await, need to check
const sourceCode = fs.readFileSync(inboxPath, 'utf8');

// Exports the compiled code for this contract specifically
// Contains parameters named 'interface' and 'bytecode' for the ABI and Byte code respectively
module.exports = solc.compile(sourceCode, 1).contracts[':Inbox'];

