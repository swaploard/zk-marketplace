"use client";

import { useEffect, useState } from "react";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi"; 

export default function SignUp() {
  const { isConnected } = useAccount();
  const { openConnectModal } = useConnectModal();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true); 
  }, []);

  useEffect(() => {
    if (mounted && !isConnected) {
      openConnectModal?.();
    }
  }, [mounted, isConnected]);

  if (!mounted) return null; 

  return <div />;
}
