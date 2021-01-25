const celoLib = require('../index');
require("dotenv").config({path: `${__dirname}/.env`})
const chai = require('chai')
const expect = chai.expect
const assert = chai.assert
chai.use(require("chai-as-promised"))

let mainTimeout = 3000

let toWalletAddress = process.env.TOWALLETADDRESS
let network = process.env.NETWORK
let privateKey = process.env.PRIVATE_KEY
let amount =  "1"
let from

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
        "tx",
        "receipt"
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

    it("should sendTransaction sending CELO", async function () {
        this.timeout(mainTimeout * 3);

        const result = await celoLib.sendTransaction(
            toWalletAddress,
            amount,
            network,
            privateKey,
            'celo',
            'celo');

        assert.hasAllKeys(result, keys.sendTransaction);
        runtime.transactionHash = result.transactionHash;
    });

    it("should sendTransaction sending cUSD", async function () {
        this.timeout(mainTimeout * 3);

        const result = await celoLib.sendTransaction(
            toWalletAddress,
            amount,
            network,
            privateKey,
            'cusd',
            'cusd');
        
        // for use in next test
        from = result.from

        assert.hasAllKeys(result, keys.sendTransaction);
        runtime.transactionHash = result.transactionHash;
    });

    it("should fail when sending too much CELO", async function () {
        this.timeout(mainTimeout * 3);

        amount = celoLib.getBalance(from, network)
        amount += 1

        await expect(celoLib.sendTransaction(
            toWalletAddress,
            amount,
            network,
            privateKey,
            'celo',
            'celo')).to.be.rejectedWith(Error)
    });
    
    it("should fail sending too much cUSD", async function () {
        this.timeout(mainTimeout * 3);

        amount = celoLib.getBalance(from, network)
        amount += 1

        await expect(celoLib.sendTransaction(
            toWalletAddress,
            amount,
            network,
            privateKey,
            'cusd',
            'cusd')).to.be.rejectedWith(Error)
    });

    it("should fail with unrecognized token", async function () {
        this.timeout(mainTimeout * 3);

        amount = celoLib.getBalance(from, network)
        amount += 1

        await expect(celoLib.sendTransaction(
            toWalletAddress,
            amount,
            network,
            privateKey,
            'aaa',
            'aaa')).to.be.rejectedWith(Error)
    });

    it("should getTransaction", async function () {
        this.timeout(mainTimeout * 3);
        const result = await celoLib.getTransaction(runtime.transactionHash, network);
        assert.hasAllKeys(result, keys.getTransaction);
    });
});
