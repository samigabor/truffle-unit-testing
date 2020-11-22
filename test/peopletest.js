const People = artifacts.require('People');
const truffleAssert = require('truffle-assertions');

contract('People', async () => {
  it('should not create a person older than 150 years', async () => {
    const contractInstance = await People.deployed();
    await truffleAssert.fails(
      contractInstance.createPerson('Sam', 151, 180, {value: web3.utils.toWei('1', 'ether')}),
      truffleAssert.ErrorType.REVERT
    );
  });

  it('should not create a person without payment', async () => {
    const contractInstance = await People.deployed();
    await truffleAssert.fails(
      contractInstance.createPerson('Samy', 40, 180, { value: 1000 }),
      truffleAssert.ErrorType.REVERT
    );
  });

  it('should set senior status correctly', async () => {
    const contractInstance = await People.deployed();
    await contractInstance.createPerson('Sammy', 70, 170, {value: web3.utils.toWei('1', 'ether')});
    const person = await contractInstance.getPerson();
    assert.equal(person[3], true);
  });

  it('should set the age correctly', async () => {
    const contractInstance = await People.deployed();
    const person = await contractInstance.getPerson();
    assert.equal(person[1], 70);
  });
});
