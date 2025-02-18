"use client";
import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { cookieStorage, createStorage, http } from "wagmi";
import { polygon, sepolia } from "viem/chains";
export const projectId = process.env.NEXT_PUBLIC_PROJECT_ID as string;

export const config = getDefaultConfig({
  appName: "zk-marketplace",
  projectId: "project id",
  chains: [polygon, sepolia],
  ssr: true,
  storage: createStorage({
    storage: cookieStorage,
  }),
  transports: {
    [polygon.id]: http(),
  },
});
