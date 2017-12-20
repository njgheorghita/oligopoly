var Oligopoly = artifacts.require("./Oligopoly.sol");

module.exports = function(deployer) {
  deployer.deploy(Oligopoly);
};
