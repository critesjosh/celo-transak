const config = require('./config');
const BigNumber = require('bignumber.js');
const Web3 = require("web3");
const ContractKit = require("@celo/contractkit");
const timeOut = 20000;

const _toDecimal = (amount, decimals) => {
    return new BigNumber(amount).div(`1e${decimals}`).toString(10);
}

function getTransactionLink(txId, network) {
    let networkDetails = (network === 'main') ? config.networks.main : config.networks.testnet;
    return networkDetails.transactionLink(txId);
}

function getWalletLink(walletAddress, network) {
    let networkDetails = (network === 'main') ? config.networks.main : config.networks.testnet;
    return networkDetails.walletLink(walletAddress);
}

async function getBalance(address, network) {
    try {
        let networkDetails = (network === 'main') ? config.networks.main : config.networks.testnet;
        const web3 = new Web3(networkDetails.provider);
        let contractKit = ContractKit.newKitFromWeb3(web3)
        const rawBalance = await contractKit.connection.getBalance(address)
        if (rawBalance) return Number(_toDecimal(rawBalance, 18));
        else return 0;
    } catch (e) {
        console.error(e)
        return 0;
    }
}

async function isValidWalletAddress(address, network) {
    try {
        let networkDetails = (network === 'main') ? config.networks.main : config.networks.testnet;
        let web3 = new Web3(networkDetails.provider)
        let isValid = web3.utils.isAddress(address)
        if (!isValid) return false;
        else return true;
    } catch (e) {
        return false;
    }
}

async function getTransaction(hash, network) {
    let response = false;
    try {
        if (hash) {
            let networkDetails = (network === 'main') ? config.networks.main : config.networks.testnet;

            const web3 = new Web3(networkDetails.provider)
            const contractKit = ContractKit.newKitFromWeb3(web3)
            let tx = await contractKit.connection.getTransaction(hash)

            if (tx) {
                response = {
                    tx: tx,
                    date: new Date(),
                    transactionHash: hash,
                    transactionLink: networkDetails.transactionLink(hash),
                    network: networkDetails.networkName,
                    gasPrice: tx.gasPrice,
                    gas: tx.gas,
                    feeCurrency: tx.feeCurrency,
                    gatewayFee: tx.gatewayFee,
                    gatewayFeeRecipient: tx.gatewayFeeRecipient,
                    gasCostInCrypto: Number(_toDecimal((tx.gasPrice * tx.gasLimit), 18)),
                    value: Number(_toDecimal(tx.value, 18)),
                    from: tx.from,
                    to: tx.to,
                    nonce: tx.nonce
                }
            } else resonse = null
        }
        return response
    } catch (e) {
        console.log(e)
    }
}

async function sendTransaction(to, amount, network, privateKey, token = 'CELO', feeCurrency = 'CELO') {
    try {
        //Set network
        let networkDetails = (network === 'main') ? config.networks.main : config.networks.testnet;

        //Set provider
        let web3 = new Web3(networkDetails.provider)
        let contractKit = ContractKit.newKitFromWeb3(web3)

        let gasCostCryptoCurrency = (feeCurrency.toLowerCase() === 'celo') ? null :  await contractKit.registry.addressFor(ContractKit.CeloContract.StableToken)

        //get signer data using key
        contractKit.addAccount(privateKey)

        let accounts = await contractKit.connection.getAccounts()
        let account = accounts[0]

        let balance, tx, currentBalance

        if (token.toUpperCase() === 'CELO'){
            balance = await contractKit.connection.getBalance(account)
            if (Number(_toDecimal(balance, 18)) < Number(_toDecimal(amount, 18))) throw new Error('Insufficient CELO balance in wallet')

            tx = await contractKit.sendTransaction({
                from: account,
                to: to,
                value: amount,
                feeCurrency: gasCostCryptoCurrency
            })
        }
        else if (token.toUpperCase() === 'CUSD'){
            stableToken = await contractKit.contracts.getStableToken()
            
            balance = await stableToken.balanceOf(account)
            if (Number(_toDecimal(balance, 18)) < Number(_toDecimal(amount, 18))) throw new Error('Insufficient cUSD balance in wallet')

            tx = await stableToken.transfer(to, amount).send({ from: account, feeCurrency: gasCostCryptoCurrency })
        } else {
            throw new Error('Unrecognized token')
        }

        let receipt = await tx.waitReceipt()

        return ({
            date: new Date(),
            transactionHash: receipt.transactionHash,
            transactionLink: networkDetails.transactionLink(tx.hash),
            network: networkDetails.networkName,
            gas: tx.gasUsed,
            gasCostInCrypto: Number(_toDecimal((tx.gasPrice * tx.gasLimit), 18)),
            gasCostCryptoCurrency: gasCostCryptoCurrency,
            amount: Number(_toDecimal(tx.value, 18)),
            from: account,
            to: receipt.to,
            receipt: receipt
        });
    } catch (e) {
        throw(e)
    }
}

module.exports = {
    getTransactionLink,
    getWalletLink,
    getTransaction,
    isValidWalletAddress,
    sendTransaction,
    getBalance,
};
