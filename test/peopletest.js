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
    await instance.createPerson('Sam33', 70, 170, {value: web3.utils.toWei('1', 'ether')});
    const person = await instance.getPerson();
    assert.equal(person[1], 70);
  });

  it('should allow owner to delete people(the owner is the first address in the accounts array)', async () => {
    await instance.createPerson('Sam4', 30, 170, {from: accounts[1], value: web3.utils.toWei('1', 'ether')});
    truffleAssert.passes(instance.deletePerson(accounts[0]), truffleAssert.ErrorType.REVERT);
  });

  // it('should not allow non-owner to delete people', async () => {
  //   await instance.createPerson('Sam5', 30, 170, {from: accounts[1], value: web3.utils.toWei('1', 'ether')});
  //   truffleAssert.fails(instance.deletePerson(accounts[1]), truffleAssert.ErrorType.REVERT);
  // });

  it('should allow owner to withdraw all balance', async () => {
    await instance.createPerson('Sam6', 18, 180, {from: accounts[1], value: web3.utils.toWei('1', 'ether')});
    truffleAssert.passes(instance.withdrawAll());
  });

  it('should not allow not-owner to withdraw all balance', async () => {
    await instance.createPerson('Sam7', 18, 180, {from: accounts[1], value: web3.utils.toWei('1', 'ether')});
    truffleAssert.fails(instance.withdrawAll({from: accounts[1]}), truffleAssert.ErrorType.REVERT);
  });

  it('should increase contract balance when creating a new person', async () => {
    const contractAddress = await instance.address;
    const balanceBeforeCreatePerson = await web3.eth.getBalance(contractAddress);
    await instance.createPerson('Sam8', 18, 180, {from: accounts[1], value: web3.utils.toWei('1', 'ether')});
    const balanceAfterCreatePerson = await web3.eth.getBalance(contractAddress);
    assert.isTrue(balanceAfterCreatePerson > balanceBeforeCreatePerson, 'Contract balance has increased.');
  });

  it('should have a contract balance of 0 after withdraw all balance', async () => {
    await instance.createPerson('Sam9', 18, 180, {from: accounts[1], value: web3.utils.toWei('1', 'ether')});
    await instance.withdrawAll();
    const balanceAfterWithdrawAll = await web3.eth.getBalance(instance.address);
    assert.equal(balanceAfterWithdrawAll, '0', 'Contract balance should be 0 after withdrawAll');
  });

  it('should increase the owner balance after withdraw all balance', async () => {
    const ownerBalanceBeforeCreatePerson = Number(web3.utils.fromWei(await web3.eth.getBalance(accounts[0])));
    await instance.createPerson('Sam10', 18, 180, {from: accounts[1], value: web3.utils.toWei('1', 'ether')});
    await instance.withdrawAll();
    const ownerBalanceAfterCreatePerson = Number(web3.utils.fromWei(await web3.eth.getBalance(accounts[0])));
    assert.isTrue(ownerBalanceAfterCreatePerson > ownerBalanceBeforeCreatePerson, 'Owner balance has increased');
  });

  // it('contract balance should be equal with the blockchain balance', async () => {
  //   // TODO
  // });

  // it('should have a blockchain balance of 0 after withdraw all balance', async () => {
  //   // TODO
  // });
});
