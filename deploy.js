require("dotenv").config();
const HDWalletProvider = require("@truffle/hdwallet-provider");
const Web3 = require("web3");
const compiledCampaignFactory = require("./build/CampaignFactory.json");

const provider = new HDWalletProvider({
  privateKeys: [process.env.PRIVATE_KEY],
  providerOrUrl: process.env.INFURA_API_URL,
});

const web3 = new Web3(provider);

//deploy contract
const deploy = async () => {
  const accounts = await web3.eth.getAccounts();
  console.log("Contract is being deployed from", accounts[0]);

  const newContractInstance = await new web3.eth.Contract(
    compiledCampaignFactory.abi
  )
    .deploy({
      data: compiledCampaignFactory.evm.bytecode.object,
    })
    .send({ from: accounts[0] });

  console.log("Contract deployed to", newContractInstance.options.address);
  provider.engine.stop();
};

deploy();
