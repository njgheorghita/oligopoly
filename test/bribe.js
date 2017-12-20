var Bribe = artifacts.require("./Bribe.sol");
require("../node_modules/web3/packages/web3-utils/src/index.js");

contract('Bribe', function(accounts) {
  let bribe;
  let first_party;
  let second_party;
  let third_party;

  beforeEach(async function() {
    first_party = accounts[0];
    second_party = accounts[1];
    third_party = accounts[2];
    bribe = await Bribe.new(first_party, second_party, third_party);
  });
	
  it("is created with a firstParty and secondParty", async function() {
    let first = await bribe.firstParty();
    let second = await bribe.secondParty();
    let third = await bribe.thirdParty();
    let bribeStatus = await bribe.bribeStatus();
    let initialBribe = await bribe.initialBribe();

    assert.equal(first, first_party);
    assert.equal(second, second_party);
    assert.equal(third, third_party);
    assert.equal(web3.toDecimal(bribeStatus), 0);
    assert.equal(web3.toDecimal(initialBribe), 0);
  });

  it("can be funded", async function() {
    await bribe.fund({from: accounts[3], value: 10});
    let initialBribe = await bribe.initialBribe();
    let bribeStatus = await bribe.bribeStatus();
	let contractBalance = web3.eth.getBalance(bribe.address);
	assert.equal(web3.toDecimal(contractBalance), 10);
    assert.equal(web3.toDecimal(initialBribe), 10);
    assert.equal(web3.toDecimal(bribeStatus), 1);
  });

  it("cannot be funded with 0 ether", async function() {
	try {
		await bribe.fund({from: accounts[3], value: 0});
	} catch (err) {
		assert.include(String(err), "invalid opcode");	
	}
  });

  it("cannot be funded if it's live", async function() {
	await bribe.fund({from: accounts[3], value: 10});
	try {
		await bribe.fund({from: accounts[3], value: 10});
	} catch (err) {
		assert.include(String(err), "invalid opcode");
	}
  });

  it("can accept a bribe", async function() {
	await bribe.fund({from: accounts[3], value: 10});
    await bribe.bribeParty(first_party, {from: accounts[3], value: 1});
    let firstBalance = await bribe.bribeTally(first_party);	
    let secondBalance = await bribe.bribeTally(second_party);
    let thirdBalance = await bribe.bribeTally(third_party);
    let numberOfOligarchs = await bribe.numberOfOligarchs();
	assert.equal(web3.toDecimal(numberOfOligarchs), 1);
	assert.equal(web3.toDecimal(firstBalance), 1);
    assert.equal(web3.toDecimal(secondBalance), 0);
    assert.equal(web3.toDecimal(thirdBalance), 0);
  });
  
  it("cannot accept a bribe unless it's live", async function() {
	try {
		await bribe.bribeParty(first_party, {from: accounts[3], value:1});
	} catch (err) {
		assert.include(String(err), "invalid opcode");	
	}
	let numberOfOligarchs = await bribe.numberOfOligarchs();
	let firstBalance = await bribe.bribeTally(third_party);
	let contractBalance = web3.eth.getBalance(bribe.address);
	assert.equal(web3.toDecimal(contractBalance), 0);
	assert.equal(web3.toDecimal(numberOfOligarchs), 0);
	assert.equal(web3.toDecimal(firstBalance), 0);
  });


  it("can accept multiple bribes from the same person", async function() {
	await bribe.fund({from: accounts[3], value: 10});
	await bribe.bribeParty(first_party, {from: accounts[3], value: 1});
	await bribe.bribeParty(first_party, {from: accounts[3], value: 1});
	let firstBalance = await bribe.bribeTally(first_party);
	assert.equal(web3.toDecimal(firstBalance), 2);
  });

  it("can keep track of a sender's bribes", async function() {
	await bribe.fund({from: accounts[3], value: 10});
	await bribe.bribeParty(first_party, {from: accounts[3], value: 1});
	let paperTrail = await bribe.getPaperTrail(accounts[3]);
	let contractBalance = await web3.eth.getBalance(bribe.address);
	assert.equal(web3.toDecimal(contractBalance), 11);
	assert.equal(paperTrail[0][0], accounts[3]);
	assert.equal(paperTrail[1][0], 1);
	assert.equal(paperTrail[2][0], 1);
  });

  it("can keep track of multiple bribes from single oligarch", async function() {
	await bribe.fund({from: accounts[3], value:10});
	await bribe.bribeParty(first_party, {from: accounts[3], value: 1});
	await bribe.bribeParty(first_party, {from: accounts[3], value: 1});
	let paperTrail = await bribe.getPaperTrail(accounts[3]);
	let contractBalance = await web3.eth.getBalance(bribe.address);
	assert.equal(web3.toDecimal(contractBalance), 12);
	assert.equal(paperTrail[0][0], accounts[3]);
	assert.equal(web3.toDecimal(paperTrail[1][0]), 2);
	assert.equal(web3.toDecimal(paperTrail[2][0]), 2);
  });

  it("can only endBribe with status of Live", async function() {
	try {
		await bribe.endBribe();
	} catch (err) {
		assert.include(String(err), "invalid opcode");
	}	
	let bribeStatus = await bribe.bribeStatus();
	assert.equal(web3.toDecimal(bribeStatus), 0);
	await bribe.fund({from: accounts[3], value: 10});
	bribeStatus = await bribe.bribeStatus();
	assert.equal(web3.toDecimal(bribeStatus), 1);
	await bribe.endBribe();
	bribeStatus = await bribe.bribeStatus();
	assert.equal(web3.toDecimal(bribeStatus), 2);
	try {
		await bribe.endBribe();
	} catch (err) {
		assert.include(String(err), "invalid opcode");
	}
	bribeStatus = await bribe.bribeStatus();
	assert.equal(web3.toDecimal(bribeStatus), 2);
  });
});

