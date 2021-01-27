const celoLib = require('../index');
const chai = require('chai')
const expect = chai.expect
const assert = chai.assert
chai.use(require("chai-as-promised"))
require("dotenv").config({path: `${__dirname}/.env`})

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
        "amount",
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
        "receipt",
        "token"
    ]
};

// validate object by all it's keys
const allKeys = (result, keys) => {
    for (let key in keys) {
        expect(result).to.have.property(keys[key].name);
    }
};

describe("CELO-mainet module", () => {

    it("should isValidWalletAddress", async function () {
        this.timeout(mainTimeout * 3);
        const result = await celoLib.isValidWalletAddress(toWalletAddress, network);
        expect(result === true);
    });

    it("should sendTransaction sending CELO", async function () {
        this.timeout(mainTimeout * 3);

        const result = await celoLib.sendTransaction({
            to: toWalletAddress,
            amount,
            network,
            privateKey,
            token: 'celo',
            feeCurrency: 'celo'
        });

        assert.hasAllKeys(result, keys.sendTransaction);
        runtime.celoTransactionHash = result.transactionHash;
    });

    it("should sendTransaction sending cUSD", async function () {
        this.timeout(mainTimeout * 3);

        const result = await celoLib.sendTransaction({
            to: toWalletAddress,
            amount,
            network,
            privateKey,
            token: 'cusd',
            feeCurrency: 'cusd'
        });

        from = result.from

        assert.hasAllKeys(result, keys.sendTransaction);
        runtime.cusdTransactionHash = result.transactionHash;
    });

    it("should fail sending too much CELO", async function () {
        this.timeout(mainTimeout * 3);

        amount = celoLib.getBalance(from, network)
        amount += 1
        await expect(celoLib.sendTransaction({
            to: toWalletAddress,
            amount,
            network,
            privateKey,
            token: 'celo',
            feeCurrency: 'celo'
        })).to.be.rejectedWith(Error)
    });

    it("should fail sending too much cUSD", async function () {
        this.timeout(mainTimeout * 3);

        amount = celoLib.getBalance(from, network)
        amount += 1

        await expect(celoLib.sendTransaction({
            to: toWalletAddress,
            amount,
            network,
            privateKey,
            token: 'cusd',
            feeCurrency: 'cusd'
        })).to.be.rejectedWith(Error)
    });

    it("should fail with unrecognized token", async function () {
        this.timeout(mainTimeout * 3);

        amount = celoLib.getBalance(from, network)
        amount += 1

        await expect(celoLib.sendTransaction({
            to: toWalletAddress,
            amount,
            network,
            privateKey,
            token: 'aaa',
            feeCurrency: 'aaa'
        })).to.be.rejectedWith(Error)
    });

    it("should get Celo Transaction", async function () {
        this.timeout(mainTimeout * 3);
        const result = await celoLib.getTransaction(runtime.celoTransactionHash, network);
        expect(result.amount == amount)
        assert.hasAllKeys(result, keys.getTransaction);
    });

    it("should get cUSD Transaction", async function () {
        this.timeout(mainTimeout * 3);
        const result = await celoLib.getTransaction(runtime.cusdTransactionHash, network);
        expect(result.amount == amount)
        assert.hasAllKeys(result, keys.getTransaction);
    });

    it("should get CELO Balance", async function () {
        this.timeout(mainTimeout * 3);
        const result = await celoLib.getBalance(toWalletAddress, network);
        expect(typeof result === "number");
        expect(result != 0);
    });

    it("should get cUSD Balance", async function () {
        this.timeout(mainTimeout * 3);
        const result = await celoLib.getBalance(toWalletAddress, network, "cUSD");
        expect(typeof result === "number");
        expect(result != 0);
    });
});
