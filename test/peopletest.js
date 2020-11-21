const People = artifacts.require('People');
const truffleAssert = require('truffle-assertions');

contract('People', async () => {
  it('should not create a person older than 150 years', async () => {
    const instance = await People.deployed();
    await truffleAssert.fails(
      instance.createPerson('Sam', 151, 180, {value: web3.utils.toWei('1', 'ether')}),
      truffleAssert.ErrorType.REVERT
    )
  })
})