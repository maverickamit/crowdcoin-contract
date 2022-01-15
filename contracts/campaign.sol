
pragma solidity ^0.4.17;

contract CampaignFactory{
    address[] public deployedCampaigns;

    function createCampaign(uint minimum) public{
        address newCampaign = new Campaign(minimum, msg.sender);
        deployedCampaigns.push(newCampaign);
    }

    function getDeployedCampaigns() public view returns (address[]){
        return deployedCampaigns;
    }

}

contract Campaign {
    
    address public manager;
    uint public minimumContribution;
    mapping(address => bool) public contributors;
    uint public contributorsCount;

    struct Request{
        string description;
        uint valueInWei;
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

    modifier isAContributor () {
        require(contributors[msg.sender]);
        _;
    }
    
    function Campaign(uint minimum, address creator) public {
        manager = creator;
        minimumContribution = minimum;
    }

    function contribute () public payable {
        require(msg.value> minimumContribution);
        if (!contributors[msg.sender]) {
         contributorsCount++;
        }
      contributors[msg.sender] = true;
    }
    
    function createRequest (string description, uint valueInWei, address receipient) public restricted  {
        Request memory newRequest = Request({
            description:description,
            valueInWei:valueInWei,
            receipient:receipient,
            complete:false,
            approvalCount:0
        });
        requests.push(newRequest);
    }

    function approveRequest (uint index) public isAContributor {
        Request storage request = requests[index];
        require(!request.voters[msg.sender]);
        request.approvalCount ++;
        request.voters[msg.sender]=true;
    }

    function finalizeRequest (uint index) public restricted {
        Request storage request = requests[index];
        require(!request.complete);
        require(request.approvalCount >= contributorsCount/2);
        request.receipient.transfer(request.valueInWei);
        request.complete = true;  
    }

    function getSummary() public view returns(uint,uint,uint,uint,address) {
        return (
            minimumContribution,
            this.balance,
            requests.length,
            contributorsCount,
            manager
        );
    }

    function getRequestsCount() public view returns(uint) {
        return requests.length;
    }
}