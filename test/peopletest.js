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

  it('should delete a person', async () => {
    await instance.createPerson('Sam4', 30, 170, {value: web3.utils.toWei('2', 'ether')});
    let person = await instance.getPerson();
    assert.equal(person[0], 'Sam4', 'The name should be Sam4.');

    await instance.deletePerson(accounts[0]);
    person = await instance.getPerson();
    assert.equal(person[0], '', 'The name should be an empty string because the person was deleted.');
  });

  it('should allow only contract owners to delete persons', async () => {
    await instance.createPerson('Sam5', 30, 180, {value: web3.utils.toWei('1', 'ether')});
    await instance.deletePerson(accounts[1]);
    let person = await instance.getPerson();
    assert.equal(person[0], 'Sam5', 'Person should not be deleted by anyone other than the owner.')

    await instance.deletePerson(accounts[0]);
    person = await instance.getPerson();
    assert.equal(person[0], '', 'The name should be an empty string because the person was deleted by the contract owner.')
  })
});
