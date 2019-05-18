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
let managerAccount;
let lottery;

beforeEach(async () => {
	fetchedAccounts = await web3.eth.getAccounts();
	managerAccount = fetchedAccounts[0];

	
	lottery = await new web3.eth.Contract(interface)
	.deploy({data: bytecode })
	.send({from: managerAccount, gas: '1000000'});

	// console.log(lottery._address);
	// console.log(lottery);

});

describe("Lottery test cases", () => {
	it("Contract Deployment Check", () => {
		assert.ok(lottery.options.address);
	});
	it("Manager address set correctly", async () => {
		assert.equal(await lottery.methods.managerAddress().call(), managerAccount);
	});
	it("Check Lottery Registration (Manager)", async () => {
		transactionAccount = fetchedAccounts[0];
		transHash = await lottery.methods.registerForLottery().send({from:transactionAccount, value:web3.utils.toWei("0.2",'ether')});
		newEntry = await lottery.methods.memberList(0).call();
		assert.equal(newEntry, transactionAccount);
	});
	it("Check Lottery Registration (Third Party)", async () => {
		transactionAccount = fetchedAccounts[1];
		transHash = await lottery.methods.registerForLottery().send({from:transactionAccount, value:web3.utils.toWei("0.2", "ether")});
		newEntry = await lottery.methods.memberList(0).call();
		assert.equal(newEntry, transactionAccount);
	});
});