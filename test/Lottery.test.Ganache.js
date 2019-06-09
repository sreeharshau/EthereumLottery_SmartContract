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

// Variable declaration outside using let enables shared access to these between beforeEach and the its in describe
let fetchedAccounts;
let managerAccount;
let lottery;

// Create a fresh lottery contract before each test
beforeEach(async () => {
	fetchedAccounts = await web3.eth.getAccounts();
	managerAccount = fetchedAccounts[0];
	
	lottery = await new web3.eth.Contract(interface)
	.deploy({data: '0x' + bytecode })
	.send({from: managerAccount, gas: '5000000'});

});

describe("Lottery test cases", () => {
	it("Contract Deployment Check", () => {
		// Check if contract is deployed at a valid address
		assert.ok(lottery.options.address);
	});
	it("Manager address set correctly", async () => {
		// Check if manager address is set correctly
		assert.equal(await lottery.methods.managerAddress().call(), managerAccount);
	});
	it("Lottery Registration (Manager)", async () => {
		// Check if manager account is correctly able to register for the lottery
		transactionAccount = managerAccount;
		transHash = await lottery.methods.registerForLottery().send({from:transactionAccount, value:web3.utils.toWei("0.2",'ether'), gas: '5000000'});
		newEntry = await lottery.methods.memberList(0).call();

		var returnedObject  = await lottery.methods.getCurrentWinningChances().call({from: transactionAccount});

		winningChances = returnedObject[0];
		totalChances = returnedObject[1];

		// Check for new entry in memberList as well as correct winning and total chances
		assert.equal(newEntry, transactionAccount);
		assert.equal(winningChances, 2);
		assert.equal(totalChances, 2);
	});
	it("Lottery Registration (Third Party)", async () => {
		// Check if accounts other than the manager are able to correctly register for the lottery
		transactionAccount = fetchedAccounts[1];
		transHash = await lottery.methods.registerForLottery().send({from:transactionAccount, value:web3.utils.toWei("0.2", "ether"), gas: '5000000'});
		newEntry = await lottery.methods.memberList(0).call();
		
		var returnedObject  = await lottery.methods.getCurrentWinningChances().call({from: transactionAccount});

		winningChances = returnedObject[0];
		totalChances = returnedObject[1];

		// Check for new entry in memberList as well as correct winning and total chances
		assert.equal(newEntry, transactionAccount);
		assert.equal(winningChances, 2);
		assert.equal(totalChances, 2);

		// Check for multiple registrations working correctly
		transHash = await lottery.methods.registerForLottery().send({from:transactionAccount, value:web3.utils.toWei("0.2", "ether"), gas: '5000000'});

		var returnedObject  = await lottery.methods.getCurrentWinningChances().call({from: transactionAccount});

		memberList = await lottery.methods.returnRegisteredMembers().call();

		winningChances = returnedObject[0];
		totalChances = returnedObject[1];

		// Check for duplicate memberList entries
		assert.equal(memberList.length, 1);

		// Check to see that chances are incremented correctly
		assert.equal(winningChances, 4);
		assert.equal(totalChances, 4);

	});
	it("Multiple Registrations (Manager + Third Party)", async () => {
		// Check if multiple registrations are correctly logged
		transHash1 = await lottery.methods.registerForLottery().send({from:fetchedAccounts[0], value:web3.utils.toWei("0.2",'ether'), gas: '5000000'});
		transHash2 = await lottery.methods.registerForLottery().send({from:fetchedAccounts[1], value:web3.utils.toWei("0.2",'ether'), gas: '5000000'});
		transHash3 = await lottery.methods.registerForLottery().send({from:fetchedAccounts[2], value:web3.utils.toWei("0.2",'ether'), gas: '5000000'});

		memberList = await lottery.methods.returnRegisteredMembers().call();

		assert.equal(memberList[0], fetchedAccounts[0]);
		assert.equal(memberList[1], fetchedAccounts[1]);
		assert.equal(memberList[2], fetchedAccounts[2]);

		assert.equal(3, memberList.length);
	});
	it("Minimum Ether For Registration", async () => {
		// Check the entry condition for registration (minimum of 0.1 ether)
		lottery.methods.registerForLottery().send({from:fetchedAccounts[0], value:web3.utils.toWei("0.01",'ether'), gas: '5000000'}, function(error, transHash1){
				if(error)
					assert(true);
				else
					assert(false);
		});
	});
	it("Access to PickLotteryWinner Blocked - Third Party", async () => {
		// Check if accounts other than the manager cannot pick a winner
		lottery.methods.pickLotteryWinner().send({from:fetchedAccounts[1]}, function(error, transHash1){
				if(error)
					assert(true);
				else
					assert(false);
		});
	});
	it("Access to PickLotteryWinner Enabled - Manager", async () => {
		// Check if the manager account can pick a winner
		transactionAccount = managerAccount;
		transHash = await lottery.methods.registerForLottery().send({from:transactionAccount, value:web3.utils.toWei("0.2",'ether'), gas: '5000000'}); 
		lottery.methods.pickLotteryWinner().send({from:managerAccount , gas: '5000000'}, function(error, transHash1){
				if(error)
					assert(false);
				else
					assert(true);
		});
	});
	it("End to End Lottery Run", async () => {
		// Check a complete run through of a lottery round
		
		// Register 3 members (1 Manager + 2 ThirdParty) for the lottery
		transHash1 = await lottery.methods.registerForLottery().send({from:fetchedAccounts[0], value:web3.utils.toWei("2",'ether'), gas: '5000000'});
		transHash2 = await lottery.methods.registerForLottery().send({from:fetchedAccounts[1], value:web3.utils.toWei("1",'ether'), gas: '5000000'});
		transHash3 = await lottery.methods.registerForLottery().send({from:fetchedAccounts[2], value:web3.utils.toWei("0.3",'ether'), gas: '5000000'});

		// Log balances of all 3 accounts after registration
		let balanceBeforeWins = [];
		let balanceUpdatedFlag = false;

		for (i = 0; i < 3; i++)
			balanceBeforeWins[i] = await web3.eth.getBalance(fetchedAccounts[i]);

		// Try to pick a winner
		transHash4 = await lottery.methods.pickLotteryWinner().send({from:managerAccount, gas: '5000000'});

		// Check if one of the account balances increased to indicate that a winner was picked and winnings transferred correctly
		for (i = 0; i < 3; i++){
			currBalance = await web3.eth.getBalance(fetchedAccounts[i]);
			if(Number(currBalance) > Number(balanceBeforeWins[i]))
				balanceUpdatedFlag = true;
		}
		assert(balanceUpdatedFlag);

		// Check if the contract resets itself correctly after picking a winner
		memberListLength = await lottery.methods.returnRegisteredMembers().call();
		assert.equal(0 ,memberListLength);

	});
});