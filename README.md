# Smart Contract For an Ethereum-Based Lottery

=> This is the back-end for the Crypto Lottery application. This is an ethereum based lottery contract which works within the following parameters:

	-> The account used to create the contract is the manager account	
	-> All players need to contribute ether in multiples of 0.1 ether and atleast 0.2 ether to register for the lottery	
		-> Winning chances increase with larger ether contributions		
		-> Multiple registrations from the same account increase winning chances
		-> The manager can also be a participant in the lottery
	-> The manager is the only account with permissions to choose a winner
		-> It currently uses a pseudo RNG to pick a winner (can be gamed if someone has enough determination)
	-> The contract resets itself ready for another round of registrations after a winner is picked
	-> The manager cannot destroy the contract unless it is empty

=> The latest copy of this contract is currently deployed on the Rinkeby Test Network at the address: 0x68ab46B1C9d4907976E1301be9e3f1367F0991f3
	-> Please use the UI provided at <Insert UI Repo link here> to interact with this contract
