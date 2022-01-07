
pragma solidity ^0.4.17;

contract Campaign {
    
    address public manager;
    uint public minimumContribution;
    mapping(address => bool) public contributors;
    uint public contributorsCount;

    struct Request{
        string description;
        uint valueInEther;
        address receipient;
        bool complete;
        uint approvalCount;
        mapping (address => bool) voters;
        
    }
    Request[] public requests;
    
    modifier restricted () {
        require(msg.sender == manager);
        _;
    }
    
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
    

    function createRequest (string description, uint valueInEther, address receipient) public restricted  {
        Request memory newRequest = Request({
            description:description,
            valueInEther:valueInEther,
            receipient:receipient,
            complete:false,
            approvalCount:0
        });
        requests.push(newRequest);
    }
}