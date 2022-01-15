const path = require("path");
const solc = require("solc");
const fs = require("fs-extra");

const buildPath = path.resolve(__dirname, "build");
fs.removeSync(buildPath);

const campaignPath = path.resolve(__dirname, "contracts", "campaign.sol");
const source = fs.readFileSync(campaignPath, "utf-8");
fs.ensureDirSync(buildPath);

var input = {
  language: "Solidity",
  sources: {
    "campaign.sol": {
      content: source,
    },
  },
  settings: {
    outputSelection: {
      "*": {
        "*": ["*"],
      },
    },
  },
};

var output = JSON.parse(solc.compile(JSON.stringify(input)));

for (var contractName in output.contracts["campaign.sol"]) {
  fs.outputJSONSync(
    path.resolve(buildPath, contractName + ".json"),
    output.contracts["campaign.sol"][contractName]
  );
}
