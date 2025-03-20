"use client";
import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { cookieStorage, createStorage, http } from "wagmi";
import { polygon, polygonAmoy, sepolia } from "viem/chains";
export const projectId = process.env.NEXT_PUBLIC_PROJECT_ID as string;

const SEPOLIA_RPC = process.env.NEXT_RPC_URL;
const AMOY_RPC = process.env.NEXT_AMOY_RPC;
export const config = getDefaultConfig({
  appName: "zk-marketplace",
  projectId: "project id",
  chains: [polygon, sepolia, polygonAmoy],
  ssr: true,
  storage: createStorage({
    storage: cookieStorage,
  }),
  transports: {
    [sepolia.id]: http(SEPOLIA_RPC),
    [polygonAmoy.id]: http(AMOY_RPC),
  },
});
