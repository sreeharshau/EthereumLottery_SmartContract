// Require relevant modules
const HDWalletProvider = require('truffle-hdwallet-provider');
const Web3 = require('web3');
const { interface, bytecode } = require('./compile.js');

// Importing this from an external file here so that my mnemonic isn't leaked on Git :P
// Export the mnemonic with the parameter name accountMnemonic in your own repo
const accountMnemonic = require('./mnemonicPhrase.js').accountMnemonic;

console.log('Using mnemonic:', accountMnemonic, "to generate unlocked accounts for deployment");

// This time we create a provider to pass to Web3
// Arg 1 is the account mnemonic phrase which is used to derive public and private keys and thus, unlock the accounts
// Arg 2 is the Infura endpoint for Rinkeby obtained from the project we created on Infura - Use https to get past Connection error
// Arg 3 is the index of the account we want to unlock, here it is 1 because our second account has ether on Rinkeby
const provider = new HDWalletProvider(
	accountMnemonic,
	'https://rinkeby.infura.io/v3/ece9cbd8b16d45cab4024d21325df64c', 1
	);

const web3 = new Web3(provider);

//This function is only declared so that we can use async and await, otherwise if using promises we could just inline this code
const deploy = async () => {
	
	// We get all accounts generated with our mnemonix similar to Ganache unlocked accounts earlier
	const fetchedAccounts = await web3.eth.getAccounts();
	
	console.log("Attempting to deploy contract using account:", fetchedAccounts[0]);

	// Deploy contract using the second account i.e. fetchedAccounts[1] since it has Rinkeby ether
	// Never forget '0x' in front of bytecode, otherwise it tries converting the already in hex bytecode to hex, doubles it in size and fails with a gasLimit error
	// No need to JSON.parse interface in newer web3 versions
	
	const lottery = await new web3.eth.Contract(interface)
	.deploy({ data: '0x' + bytecode })
	.send({ from: fetchedAccounts[0], gas: '5000000' });

	// IMPORTANT!: Log the deployment address and interface for future use, either onto console or into a file
	console.log(interface)
	console.log("Contract deployed to address:",lottery.options.address);
};


// Call the function
deploy();

