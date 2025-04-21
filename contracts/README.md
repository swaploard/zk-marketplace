## Foundry

**Foundry is a blazing fast, portable and modular toolkit for Ethereum application development written in Rust.**

Foundry consists of:

-   **Forge**: Ethereum testing framework (like Truffle, Hardhat and DappTools).
-   **Cast**: Swiss army knife for interacting with EVM smart contracts, sending transactions and getting chain data.
-   **Anvil**: Local Ethereum node, akin to Ganache, Hardhat Network.
-   **Chisel**: Fast, utilitarian, and verbose solidity REPL.

## Documentation

https://book.getfoundry.sh/

## Usage

### Build

```shell
$ forge build
```

### Test

```shell
$ forge test
```

### Format

```shell
$ forge fmt
```

### Gas Snapshots

```shell
$ forge snapshot
```

### Anvil

```shell
$ anvil
```

### Deploy

```shell
$ forge script script/Counter.s.sol:CounterScript --rpc-url <your_rpc_url> --private-key <your_private_key>
```

### Cast

```shell
$ cast <subcommand>
```

### Help

```shell
$ forge --help
$ anvil --help
$ cast --help
```


Here is a detailed README for the contracts folder:

**Contracts Folder**
=====================

This folder contains the smart contracts for our project, written in Solidity. The contracts are designed to be deployed on the Ethereum blockchain and interact with each other to provide a specific functionality.

**What are OpenZeppelin Contracts?**
------------------------------------

OpenZeppelin Contracts is a library of reusable, secure, and tested smart contracts written in Solidity. It provides a set of pre-built contracts that can be used as building blocks for more complex applications. OpenZeppelin Contracts is widely used in the Ethereum ecosystem and is considered a standard for building secure and reliable smart contracts.

**Contracts in this Folder**
---------------------------

The following contracts are included in this folder:

* `Marketplace.sol`: This contract represents a marketplace where users can buy and sell NFTs.
* `AdvancedERC1155.sol`: This contract represents an NFT that can be minted, transferred, and burned.
* `ERC1155Marketplace.sol`: This contract represents a marketplace for ERC1155 tokens.

**Standard Docs**
-----------------

### Contract ABI

The ABI (Application Binary Interface) is a JSON file that describes the contract's interface, including its functions, variables, and events.

* `Marketplace.abi.json`
* `AdvancedERC1155.abi.json`
* `ERC1155Marketplace.abi.json`

### Contract Bytecode

The bytecode is the compiled version of the contract that can be deployed on the Ethereum blockchain.

* `Marketplace.bytecode`
* `AdvancedERC1155.bytecode`
* `ERC1155Marketplace.bytecode`

### Contract Source Code

The source code is the original Solidity code for each contract.

* `Marketplace.sol`
* `AdvancedERC1155.sol`
* `ERC1155Marketplace.sol`

### Contract Documentation

The documentation for each contract is generated using the NatSpec format and can be found in the following files:

* `Marketplace.natspec.json`
* `AdvancedERC1155.natspec.json`
* `ERC1155Marketplace.natspec.json`

### OpenZeppelin Contracts

The OpenZeppelin Contracts library is included in this folder and can be found in the `lib` directory.

* `lib/openzeppelin-contracts`

### Dependencies

The following dependencies are required to compile and deploy the contracts:

* `@openzeppelin/contracts`: ^5.3.0
* `@openzeppelin/test-helpers`: ^0.5.11
* `hardhat`: ^2.9.3
* `solidity`: ^0.8.20

### Deployment

The contracts can be deployed using the `hardhat` CLI tool. See the `deploy.js` script for more information.

### Testing

The contracts can be tested using the `hardhat` CLI tool. See the `test.js` script for more information.

### License

The contracts in this folder are licensed under the MIT License.

### Contributing

Contributions to this project are welcome. Please see the `CONTRIBUTING.md` file for more information.

### Security

If you find a security vulnerability in this project, please report it to [security@example.com](mailto:security@example.com).