const assert = require("assert");
const Web3 = require("web3");
const ganache = require("ganache-cli");
const web3 = new Web3(ganache.provider());

const compiledCampaignFactory = require("../build/CampaignFactory.json");
const compiledCampaign = require("../build/Campaign.json");

let accounts;
let campaignFactory;
let campaign;
let campaignAddress;

beforeEach(async () => {
  accounts = await web3.eth.getAccounts();

  campaignFactory = await new web3.eth.Contract(compiledCampaignFactory.abi)
    .deploy({
      data: compiledCampaignFactory.evm.bytecode.object,
    })
    .send({ from: accounts[0], gas: "1500000" });

  await campaignFactory.methods.createCampaign("100").send({
    from: accounts[0],
    gas: "1500000",
  });

  [campaignAddress] = await campaignFactory.methods
    .getDeployedCampaigns()
    .call();

  campaign = await new web3.eth.Contract(compiledCampaign.abi, campaignAddress);
});

describe("Campaigns", () => {
  it("deploys a campaign factory and a campaign", () => {
    assert.ok(campaignFactory.options.address);
    assert.ok(campaign.options.address);
  });

  it("marks caller as the campaign manager", async () => {
    const manager = await campaign.methods.manager().call();
    assert.equal(accounts[0], manager);
  });

  it("allows people to contribute money and marks them as contributors", async () => {
    await campaign.methods
      .contribute()
      .send({ value: "200", from: accounts[1] });
    const isContributor = await campaign.methods
      .contributors(accounts[1])
      .call();
    assert(isContributor);
  });

  it("requires a minimum contribution", async () => {
    try {
      await campaign.methods
        .contribute()
        .send({ value: "20", from: accounts[1] });
      //   If contribute transaction is successful with less than minimum amount, new error is thrown.
      //   But this error object doesn't have same structure as the error object from transaction failure.
      throw new Error();
    } catch (err) {
      assert(err.results);
    }
  });

  it("allows manager to create a request", async () => {
    await campaign.methods
      .createRequest("Buy batteries", 100, accounts[1])
      .send({ from: accounts[0], gas: "1500000" });
    const newRequest = await campaign.methods.requests(0).call();
    assert.equal("Buy batteries", newRequest.description);
  });

  it("processes requests", async () => {
    await campaign.methods.contribute().send({
      value: web3.utils.toWei("20", "ether"),
      from: accounts[0],
    });

    await campaign.methods
      .createRequest("A", web3.utils.toWei("5", "ether"), accounts[1])
      .send({ from: accounts[0], gas: "1500000" });

    await campaign.methods.approveRequest(0).send({
      from: accounts[0],
      gas: "1500000",
    });

    //Balance before finalizing request
    let initialBalance = await web3.eth.getBalance(accounts[1]);
    initialBalance = web3.utils.fromWei(initialBalance, "ether");
    initialBalance = parseFloat(initialBalance);

    await campaign.methods.finalizeRequest(0).send({
      from: accounts[0],
      gas: "1500000",
    });

    //Balance after finalizing request
    let finalBalance = await web3.eth.getBalance(accounts[1]);
    finalBalance = web3.utils.fromWei(finalBalance, "ether");
    finalBalance = parseFloat(finalBalance);
    assert(finalBalance > initialBalance + 4);
  });
});
