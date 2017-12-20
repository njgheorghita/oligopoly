pragma solidity 0.4.15;

import "./Bribe.sol";

contract Oligopoly {
    address public supremeLeader;  
    address[] public newBribes;

    function Oligopoly(address _supremeLeader) {
        supremeLeader = _supremeLeader;
    }

    function createBribe(address _firstParty, address _secondParty, address _thirdParty) {
    	address newBribe = new Bribe(_firstParty, _secondParty, _thirdParty);
	newBribes.push(newBribe);
    }
}
