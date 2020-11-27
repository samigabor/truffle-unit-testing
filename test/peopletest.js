const People = artifacts.require('People');
const truffleAssert = require('truffle-assertions');

contract('People', async (accounts) => {
  let instance;

  beforeEach(async () => {
    instance = await People.new();
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
    await instance.createPerson('Sam4', 70, 170, {value: web3.utils.toWei('1', 'ether')});
    const person = await instance.getPerson();
    assert.equal(person[1], 70);
  });

  it('should allow owner to delete people(the owner is the first address in the accounts array)', async () => {
    await instance.createPerson('Sam5', 30, 170, { from: accounts[1], value: web3.utils.toWei('1', 'ether') });
    truffleAssert.passes(instance.deletePerson(accounts[0]), truffleAssert.ErrorType.REVERT);
  });

  // it('should not allow non-owner to delete people', async () => {
  //   await instance.createPerson('Sam5', 30, 170, { from: accounts[1], value: web3.utils.toWei('1', 'ether') });
  //   truffleAssert.fails(instance.deletePerson(accounts[1]), truffleAssert.ErrorType.REVERT);
  // });

  it('should allow owner to withdraw all balance', async () => {
    await instance.createPerson('Sam6', 18, 180, { from: accounts[2], value: web3.utils.toWei('1', 'ether') });
    truffleAssert.passes(instance.withdrawAll({ from: accounts[0] }));
  });

  it('should not allow not-owner to withdraw all balance', async () => {
    await instance.createPerson('Sam7', 18, 180, { from: accounts[2], value: web3.utils.toWei('1', 'ether') });
    truffleAssert.fails(instance.withdrawAll({ from: accounts[2]}), truffleAssert.ErrorType.REVERT);
  });

  it('should in crease contract balance when creating a new person', async () => {
    const contractAddress = await instance.address;
    const balanceBeforeCreatePerson = await web3.eth.getBalance(contractAddress);
    await instance.createPerson('Sam8', 18, 180, { from: accounts[1], value: web3.utils.toWei('1', 'ether') });
    const balanceAfterCreatePerson = await web3.eth.getBalance(contractAddress);
    assert(balanceAfterCreatePerson > balanceBeforeCreatePerson, 'Contract balance has not increased.');
  });

  it('should reset the contract balance to 0 after withdraw all', async () => {
    await instance.createPerson('Sam9', 18, 180, { from: accounts[1], value: web3.utils.toWei('1', 'ether') });
    await instance.withdrawAll();

    const contractBalance = parseFloat(await instance.balance());
    
    assert(contractBalance == web3.utils.toWei('0', 'ether'), 'Contract balance not equal to 0.');
  });

  it('should reset the blockchain balance to 0 after withdraw all', async () => {
    await instance.createPerson('Sam10', 18, 180, { from: accounts[2], value: web3.utils.toWei('1', 'ether') });
    await instance.withdrawAll();

    const blockchainBalance = await web3.eth.getBalance(instance.address);

    assert(blockchainBalance == web3.utils.toWei('0', 'ether'), 'Contract balance not equal to 0.');
  });

  it('should have contract balance equal to blockchain balance', async () => {
    await instance.createPerson('Sam11', 18, 180, { from: accounts[2], value: web3.utils.toWei('1', 'ether') });
    await instance.withdrawAll();

    const contractBalance = parseFloat(await instance.balance());
    const blockchainBalance = await web3.eth.getBalance(instance.address);
    
    assert(contractBalance == blockchainBalance, 'Contract balance not equal to blockchain balance.');
  });

  it('should increase the owner balance after withdraw all', async () => {
    await instance.createPerson('Sam12', 18, 180, { from: accounts[1], value: web3.utils.toWei('1', 'ether') });
    const balanceBeforeWithdraw = parseFloat(web3.utils.fromWei(await web3.eth.getBalance(accounts[0])));

    await instance.withdrawAll();
    const balanceAfterWithdraw = parseFloat(web3.utils.fromWei(await web3.eth.getBalance(accounts[0])));

    assert(balanceAfterWithdraw > balanceBeforeWithdraw, 'Owner balance has not increased.');
  });
});
