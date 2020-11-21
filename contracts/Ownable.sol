pragma solidity 0.7.0;

// SPDX-License-Identifier: UNLICENSED

contract Ownable {
    address public owner;

    modifier onlyOwner() {
        require(msg.sender == owner);
        _; //Continue execution
    }

    constructor() public {
        owner = msg.sender;
    }
}
