# Marketplace

## Overview
A Next.js 15 marketplace application with Ethereum authentication, Zero-Knowledge integrations, and MongoDB backend. Built with modern web3 technologies and TurboPack for development efficiency.

## Key Features
- Wallet-based authentication (Ethereum/SIWE)
- Secure session management
- MongoDB database integration
- IPFS file storage via Pinata
- Blockchain interaction with Wagmi/Viem
- Responsive UI with Radix + Tailwind
- Form validation with Zod + React Hook Form
- State management with Zustand
- TypeScript support
- End-to-end testing with Cypress

---

## Authentication Flow

### Technologies Used
- **NextAuth.js** (v4.24) - Authentication framework
- **RainbowKit** (v2.2) - Wallet connection UI
- **SIWE** (v3.0) - Sign-In with Ethereum protocol
- **iron-session** - Encrypted cookie sessions

### Flow Description
1. **Wallet Connection**  
   Users connect Ethereum wallet via RainbowKit modal
   
2. **SIWE Signature**  
   Frontend generates SIWE message:
   ```typescript
   const message = new SiweMessage({
     domain: window.location.host,
     address: walletAddress,
     statement: 'Sign in to zk-Marketplace',
     uri: window.location.origin,
     version: '1',
     chainId: 1,
     nonce: await getNonce(),
   })

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

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
