"use client";

import "@rainbow-me/rainbowkit/styles.css";
import { cookieToInitialState, WagmiProvider } from "wagmi";
import {
  RainbowKitProvider as NextRainbowKitProvider,
  RainbowKitAuthenticationProvider,
} from "@rainbow-me/rainbowkit";
import { ReactNode, useEffect } from "react";

import { useSession } from "next-auth/react";
import { authenticationAdapter } from "@/utils/authenticationAdapter";
import ReactQueryProvider from "./ReactQueryProvider";
import { config } from "@/config";
import useUserStore, { IUserStore } from "../../store/userSlice";
import { useConnectModal } from "@rainbow-me/rainbowkit";

type RainbowKitProviderProps = {
  children: ReactNode;
  cookie: string;
};

export default function RainbowKitProvider({
  children,
  cookie,
}: RainbowKitProviderProps) {
  const { openConnectModal } = useConnectModal();
  const { createUser } = useUserStore((state: IUserStore) => state);
  const { status, data } = useSession();
  const initialState = cookieToInitialState(config, cookie);

  useEffect(() => {
    if (status === "authenticated") {
      const wallet = {
        walletAddress: data.user.walletAddress,
      };
      createUser(wallet);
    } else {
      openConnectModal?.();
    }
  }, [data, status, createUser, openConnectModal]);

  return (
    <WagmiProvider config={config} initialState={initialState}>
      <ReactQueryProvider>
        <RainbowKitAuthenticationProvider
          adapter={authenticationAdapter}
          status={status}
        >
          <NextRainbowKitProvider>
            <div className="h-full min-h-dvh overflow-x-clip font-body text-foreground">
              {children}
            </div>
          </NextRainbowKitProvider>
        </RainbowKitAuthenticationProvider>
      </ReactQueryProvider>
    </WagmiProvider>
  );
}
