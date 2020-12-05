const celoLib = require('../index');
const {expect, assert} = require('chai');
require("dotenv").config({path: `${__dirname}/.env`})

let mainTimeout = 3000

let toWalletAddress = process.env.TOWALLETADDRESS
let network = process.env.NETWORK
let privateKey = process.env.PRIVATE_KEY
let amount =  "1"

const runtime = {};

const keys = {
    sendTransaction: [
        "amount",
        "date",
        "from",
        "gasCostCryptoCurrency",
        "gasCostInCrypto",
        "gas",
        "network",
        "receipt",
        "to",
        "transactionHash",
        "transactionLink"
    ],
    getTransaction : [
        "value",
        "date",
        "from",
        "gasCostInCrypto",
        "gas",
        "gasPrice",
        "network",
        "nonce",
        "to",
        "transactionHash",
        "transactionLink",
        "feeCurrency",
        "gatewayFee",
        "gatewayFeeRecipient",
        "tx"
    ]
};

// validate object by all it's keys
const allKeys = (result, keys) => {
    for (let key in keys) {
        expect(result).to.have.property(keys[key].name);
    }
};

describe("CELO-mainet module", () => {

    it("should getBalance", async function () {
        this.timeout(mainTimeout * 3);
        const result = await celoLib.getBalance(toWalletAddress, network);
        expect(typeof result === "number");
    });

    it("should isValidWalletAddress", async function () {
        this.timeout(mainTimeout * 3);
        const result = await celoLib.isValidWalletAddress(toWalletAddress, network);
        expect(result === true);
    });

    it("should sendTransaction", async function () {
        this.timeout(mainTimeout * 3);

        const result = await celoLib.sendTransaction(
            toWalletAddress,
            amount,
            network,
            privateKey,
            'cusd');

        assert.hasAllKeys(result, keys.sendTransaction);
        runtime.transactionHash = result.transactionHash;
    });

    it("should getTransaction", async function () {
        this.timeout(mainTimeout * 3);
        const result = await celoLib.getTransaction(runtime.transactionHash, network);
        assert.hasAllKeys(result, keys.getTransaction);
    });
});