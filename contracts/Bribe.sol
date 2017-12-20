pragma solidity 0.4.15;

contract Bribe {
    address public firstParty;
    address public secondParty;
    address public thirdParty;
    uint256 public initialBribe;
	uint256 public numberOfOligarchs;
    mapping(address => uint256) public bribeTally;
 	mapping(address => Oligarch) oligarchs;
    struct Oligarch {
		address sender;
		uint256 amount;
		uint256 numberOfBribes;
    }
	enum Status { NotFunded, Live, Complete }
	Status public bribeStatus;


    function Bribe(address _first, address _second, address _third) {
		firstParty = _first;
		secondParty = _second;
		thirdParty = _third;
		initialBribe = 0;
		numberOfOligarchs = 0;
		bribeStatus = Status.NotFunded;
    }

	function fund() payable {
		assert(bribeStatus == Status.NotFunded);
		assert(msg.value > 0);
		bribeStatus = Status.Live;
		initialBribe = msg.value;
    }

	function bribeParty(address _party) payable {
		assert(bribeStatus == Status.Live);

		numberOfOligarchs = numberOfOligarchs + 1;
		uint256 previous_tally = bribeTally[_party];
		bribeTally[_party] = msg.value + previous_tally;		
		if (oligarchs[msg.sender].sender == msg.sender) {
			Oligarch memory currentOligarch = oligarchs[msg.sender];
			
			uint256 tempAmount = currentOligarch.amount + msg.value;
			uint256 tempNumberOfBribes = currentOligarch.numberOfBribes + 1;
			Oligarch memory updatedOligarch = Oligarch(msg.sender, tempAmount, tempNumberOfBribes);
			oligarchs[msg.sender] = updatedOligarch;
		} else {
			Oligarch memory newOligarch = Oligarch(msg.sender, msg.value, 1);
			oligarchs[msg.sender] = newOligarch;	
		}
	}

	function getPaperTrail(address _oligarch) constant returns(address[], uint256[], uint256[]) {
		address[] memory addresses = new address[](numberOfOligarchs);
		uint256[] memory amounts = new uint256[](numberOfOligarchs);
		uint256[] memory numberOfBribes = new uint256[](numberOfOligarchs);
		for (uint i = 0; i < numberOfOligarchs; i++) {
			Oligarch memory currentOligarch = oligarchs[_oligarch];
			addresses[i] = currentOligarch.sender;
			amounts[i] = currentOligarch.amount;
			numberOfBribes[i] = currentOligarch.numberOfBribes;
		}
		return (addresses, amounts, numberOfBribes);
	}


	function endBribe(){
		assert(bribeStatus == Status.Live);

		bribeStatus = Status.Complete;			
    }
}
