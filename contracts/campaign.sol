// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.11;

contract CampaignFactory {

    address[] public deployedCampaigns;

    function createCampaign(uint minimum) public{
        Campaign newCampaign = new Campaign(minimum, msg.sender);
        deployedCampaigns.push(address(newCampaign));
    }

    function getDeployedCampaigns() public view returns (address[] memory ){
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
        address payable receipient;
        bool complete;
        uint approvalCount;        
    }
    Request [] public requests;

   //1st argument is the index of request. 2nd argument is the address of sender.
    mapping (uint => mapping (address => bool)) public requestVoters;

    modifier restricted () {
        require(msg.sender == manager);
        _;
    }

    modifier isAContributor () {
        require(contributors[msg.sender]);
        _;
    }

    constructor (uint minimum, address creator) {
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

    function createRequest (string memory description, uint valueInWei, address payable receipient) public restricted  {
        Request memory newRequest =  Request({
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
        require(!requestVoters[index][msg.sender]);
        request.approvalCount ++; 
        requestVoters[index][msg.sender]=true;
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
            address(this).balance,
            requests.length,
            contributorsCount,
            manager
        );
    }

    function getRequestsCount() public view returns(uint) {
        return requests.length;
    }
}