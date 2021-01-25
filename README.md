# Celo-Transak

A package for integrating Celo with Transak.

## Testing

Tests are run on the live Alfajores test network.

Create a `.env` file in the test directory. The `.env` file takes the following inputs.

`TOWALLETADDRESS` can be any valid Celo address (same as any valid ETH address).

`KEYSTORE` and `PASSWORD` can be empty.

`PRIVATE_KEY` needs to be a valid private key and the corresponding Celo account address should have funds (CELO & cUSD) on the Alfajores testnet. You can create a new Celo key and account address using the `celocli`, more info [here](https://docs.celo.org/command-line-interface/commands/account#celocli-account-new). You can fund an account from the faucet [here](https://celo.org/build/faucet).

```
NETWORK="testnet"
TOWALLETADDRESS="0x58E1FB58Fa889C7b567E85dF76E09aA78b899D28"
KEYSTORE=""
PASSWORD=""
PRIVATE_KEY="0xabc123..."
```
