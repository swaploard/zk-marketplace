"use client";

import { useEffect } from "react";
import { useAccount } from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";

export default function AutoConnect() {
  const { isConnected } = useAccount();
  const { openConnectModal } = useConnectModal();

  useEffect(() => {
    if (!isConnected && openConnectModal) {
      document.cookie = "walletAddress=; path=/; SameSite=Lax";
      openConnectModal();
    }
  }, [isConnected, openConnectModal]);

  return null;
}
