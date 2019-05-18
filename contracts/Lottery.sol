// Uses a solidity version above the one specified i.e specifies bare minimum
pragma solidity ^0.5.8;

// Solidity contract for the lottery
contract Lottery {
    
    address public managerAddress;
    address payable[] public memberList;
    
    // msg is a built-in global variable containing fields with transaction info
    constructor() public{
        // Set manager address to be the same as contract creator
        managerAddress = msg.sender;
    }
    
    // This function is payable because it needs ether to be sent to it for registering
    function registerForLottery() public payable {
        require(msg.value > 0.1 ether);
        memberList.push(msg.sender);
    }
    
    // Note: NOT A RELIABLE RNG. There are ways of gaming the lottery system if this is used. Should suffice for now though.
    function genPseudoRandom() view private returns (uint256) {
        // keccak256 is the new sha3, block and now are new global vars similar to msg
        return uint256(keccak256(abi.encodePacked(block.difficulty, now, memberList)));
    }
    
    // Restricted to just the manager via modifier
    function pickLotteryWinner() public restrictedToManager {
        // Selects a winner randomly (almost!)
        uint winningIndex = (genPseudoRandom() % memberList.length);
        address payable winningPlayer = memberList[winningIndex];
        winningPlayer.transfer(address(this).balance);
        
        // Resets the member list to enable next round of lottery
        memberList = new address payable[](0);
    }
    
    // In general, arrays when declared as public do get an inbuilt helper func, but it can access only one member at a time. Hence this.
    function returnRegisteredMembers() public view returns(address payable[] memory){
        return memberList;
    }
    
    // _ is the place where code from the function using this modifier is substituted
    modifier restrictedToManager() {
        require (msg.sender == managerAddress);
        _;
    }
    
}