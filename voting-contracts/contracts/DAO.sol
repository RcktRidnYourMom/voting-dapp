// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract UomiDAO {
    uint public proposalCount;
    IERC20 public uomi;

    uint public constant PROPOSAL_COST = 10 * 1e18;
    uint public constant VOTE_COST = 1 * 1e18;

    constructor(address _uomiToken) {
        uomi = IERC20(_uomiToken);
    }

    struct ProposalData {
        uint id;
        address proposer;
        string title;
        string description;
        string[] options;
        uint[] votes;
        uint deadline;
        bool executed;
    }

    struct Proposal {
        ProposalData data;
    }

    mapping(uint => Proposal) public proposals;
    mapping(uint => mapping(address => bool)) public hasVoted;

    event ProposalCreated(uint id, address proposer);
    event Voted(uint proposalId, uint optionIndex, address voter);

    function createProposal(
        string memory _title,
        string memory _description,
        string[] memory _options,
        uint _durationSeconds
    ) public {
        require(_options.length >= 2 && _options.length <= 5, "Options must be 2-5");
        require(
            uomi.transferFrom(msg.sender, address(this), PROPOSAL_COST),
            "Proposal cost failed"
        );

        Proposal storage p = proposals[proposalCount];
        p.data = ProposalData({
            id: proposalCount,
            proposer: msg.sender,
            title: _title,
            description: _description,
            options: _options,
            votes: new uint[](_options.length),
            deadline: block.timestamp + _durationSeconds,
            executed: false
        });

        emit ProposalCreated(proposalCount, msg.sender);
        proposalCount++;
    }

    function vote(uint _proposalId, uint _optionIndex) public {
        Proposal storage p = proposals[_proposalId];
        require(block.timestamp <= p.data.deadline, "Voting has ended");
        require(!hasVoted[_proposalId][msg.sender], "Already voted");
        require(_optionIndex < p.data.options.length, "Invalid option");
        require(
            uomi.transferFrom(msg.sender, address(this), VOTE_COST),
            "Vote cost failed"
        );

        p.data.votes[_optionIndex]++;
        hasVoted[_proposalId][msg.sender] = true;
        emit Voted(_proposalId, _optionIndex, msg.sender);
    }

    function getProposal(uint _id) public view returns (
        uint id,
        address proposer,
        string memory title,
        string memory description,
        string[] memory options,
        uint[] memory votes,
        uint deadline
    ) {
        ProposalData storage d = proposals[_id].data;
        return (d.id, d.proposer, d.title, d.description, d.options, d.votes, d.deadline);
    }
}
