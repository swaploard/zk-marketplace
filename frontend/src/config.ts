"use client";
import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { cookieStorage, createStorage, http, webSocket, fallback } from "wagmi";
import { polygonAmoy, sepolia, localhost } from "viem/chains";
export const projectId = process.env.NEXT_PUBLIC_PROJECT_ID as string;

const SEPOLIA_WS_RPC = process.env.NEXT_PUBLIC_AMOY_WS_RPC;
const AMOY_WS_RPC = process.env.NEXT_PUBLIC_SEPOLIA_WS_RPC;
const SEPOLIA_HTTP_RPC = process.env.NEXT_PUBLIC_SEPOLIA_HTTP_RPC;
const AMOY_HTTP_RPC = process.env.NEXT_PUBLIC_AMOY_HTTP_RPC;
export const config = getDefaultConfig({
  appName: "zk-marketplace",
  projectId: "project id",
  chains: [ sepolia, polygonAmoy],
  ssr: true,
  syncConnectedChain: true,
  storage: createStorage({
    storage: cookieStorage,
  }),
  transports: {
    [sepolia.id]: fallback([
      http(SEPOLIA_HTTP_RPC)
     ]),
    [polygonAmoy.id]: fallback([
      http(AMOY_HTTP_RPC)
    ]),
    [localhost.id]: fallback([
      http("http://127.0.0.1:8545/")
    ])
  },
});
