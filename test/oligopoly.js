var Oligopoly = artifacts.require("./Oligopoly.sol");
var Bribe = artifacts.require("./Bribe.sol");

contract('Oligopoly', function(accounts) {
  let oligopoly;
  let first_party;
  let second_party;
  let third_party;

  beforeEach(async function() {
    oligopoly = await Oligopoly.new(accounts[0]);
    first_party = accounts[1];
    second_party = accounts[2];
    third_party = accounts[3];
  });
  
  it("is created with a supremeLeader", async function() {
    supreme_leader = await oligopoly.supremeLeader();
    assert.equal(supreme_leader, accounts[0]);
  });

  it("can create a bribe", async function() {
//    let bribe = await oligopoly.createBribe(first_party, second_party);
    
//    let newBribe = bribe.address();
//    assert.equal(newBribe, "000");
  });
});
