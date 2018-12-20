pragma solidity ^0.5.0;

contract tug {
    function bad0() external{
        require(block.timestamp == 0);
    }  
}