// Require relevant modules
// Note: This module is automatically run along with other test modules containing 'it' tests when "npm run test" is called on cmd
const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3'); // Web 3 is upper case since Web3 is a constructor function, not a direct module import, this is used to create Web3 instances
const path = require('path');

// Importing this from an external file here so that my mnemonic isn't leaked on Git :P
// Export the mnemonic with the parameter name accountMnemonic in your own repo
const web3 = new Web3(ganache.provider());

// Interface and bytecode are the names from the JSON object exported by compile.js, can't be changed
const {interface, bytecode} = require('../compile');

// console.log(interface, bytecode);


// Variable declaration outside using let enables shared access to these between beforeEach and the its in describe
let fetchedAccounts;
let lottery;

beforeEach(async () => {
	fetchedAccounts = await web3.eth.getAccounts();
	console.log("Accounts: ", fetchedAccounts);
	
	lottery = await new web3.eth.Contract(interface)
	.deploy({data: '0x' + bytecode })
	.send({from: fetchedAccounts[0], gas: '1000000'});

	// console.log(lottery);

});

describe("Lottery test cases", () => {
	it("Contract Deployment Check", () => {
		assert.ok(lottery.address);
	});
	it("Manager address set correctly", () => {
		assert.equal(lottery.managerAddress = fetchedAccounts[0]);
	});
	// it("Check Lottery Registration (Manager)", async () => {
	// 	transactionAccount = fetchedAccounts[0];
	// 	transHash = lottery.methods.registerForLottery().send({from:transactionAccount, value: 0.2 ether});
	// 	newEntry = inbox.methods.memberList(0);
	// 	assert.equal(newEntry, transactionAccount);
	// });
	// it("Check Lottery Registration (Third Party)", async () => {
	// 	transactionAccount = fetchedAccounts[1];
	// 	transHash = lottery.methods.registerForLottery().send({from:transactionAccount, value: 0.2 ether});
	// 	newEntry = inbox.methods.memberList(0);
	// 	assert.equal(newEntry, transactionAccount);
	// });
});