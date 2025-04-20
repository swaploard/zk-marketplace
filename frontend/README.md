# zk-Marketplace

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

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
