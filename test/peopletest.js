const People = artifacts.require('People');
const truffleAssert = require('truffle-assertions');

contract('People', async (accounts) => {
  let instance;

  beforeEach(async () => {
    instance = await People.deployed();
  });

  it('should not create a person older than 150 years', async () => {
    await truffleAssert.fails(
      instance.createPerson('Sam1', 151, 180, {value: web3.utils.toWei('1', 'ether')}),
      truffleAssert.ErrorType.REVERT
    );
  });

  it('should not create a person without payment', async () => {
    await truffleAssert.fails(
      instance.createPerson('Sam2', 40, 180, { value: 1000 }),
      truffleAssert.ErrorType.REVERT
    );
  });

  it('should set senior status correctly', async () => {
    await instance.createPerson('Sam3', 70, 170, {value: web3.utils.toWei('1', 'ether')});
    const person = await instance.getPerson();
    assert.equal(person[3], true);
  });

  it('should set the age correctly', async () => {
    const person = await instance.getPerson();
    assert.equal(person[1], 70);
  });

  it('should allow owner to delete people(the owner is the first address in the accounts array)', async () => {
    await instance.createPerson('Sam4', 30, 170, {from: accounts[1], value: web3.utils.toWei('1', 'ether')});
    truffleAssert.passes(instance.deletePerson(accounts[0]), truffleAssert.ErrorType.REVERT);
  });

  it('should not allow non-owner to delete people', async () => {
    await instance.createPerson('Sam5', 30, 170, {from: accounts[1], value: web3.utils.toWei('1', 'ether')});
    truffleAssert.fails(instance.deletePerson(accounts[1]), truffleAssert.ErrorType.REVERT);
  });
});
