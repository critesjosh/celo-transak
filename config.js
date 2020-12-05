module.exports = {
    networks : {
        main: {
            provider: 'https://forno.celo.org',
            transactionLink : (hash) => `https://explorer.celo.org/tx/${hash}`,
            walletLink : (address) => `https://explorer.celo.org/address/${address}`,
            networkName: 'main',

        },
        testnet: {
            provider: 'https://alfajores-forno.celo-testnet.org',
            transactionLink : (hash) => `https://alfajores-blockscout.celo-testnet.org/tx/${hash}`,
            walletLink : (address) => `https://alfajores-blockscout.celo-testnet.org/address/${address}`,
            networkName: 'alfajores',
        }
    }
}
