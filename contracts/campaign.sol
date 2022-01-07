
pragma solidity ^0.4.17;

contract Campaign {
    
    address public manager;
    uint public minimumContribution;
    mapping(address => bool) public contributors;
    uint public contributorsCount;


    
    function Campaign(uint minimum) public {
        manager = msg.sender;
        minimumContribution = minimum;
    }

    function contribute () public payable {
        require(msg.value> minimumContribution);
        if (!contributors[msg.sender]) {
         contributorsCount++;
        }
      contributors[msg.sender] = true;
    }
}