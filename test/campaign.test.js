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

  campaignFactory = await new web3.eth.Contract(
    JSON.parse(compiledCampaignFactory.interface)
  )
    .deploy({
      data: compiledCampaignFactory.bytecode,
    })
    .send({ from: accounts[0], gas: "1500000" });

  await campaignFactory.methods.createCampaign("0").send({
    from: accounts[0],
    gas: "1500000",
  });

  [campaignAddress] = await campaignFactory.methods
    .getDeployedCampaigns()
    .call();

  campaign = await new web3.eth.Contract(
    JSON.parse(compiledCampaign.interface),
    campaignAddress
  );
});

describe("Campaigns", () => {
  it("deploys a campaign factory and a campaign", () => {
    assert.ok(campaignFactory.options.address);
    assert.ok(campaign.options.address);
  });
});
