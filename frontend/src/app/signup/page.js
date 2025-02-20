"use client";
import { useEffect, useState } from "react";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi"; 
import { useRouter, useSearchParams  } from 'next/navigation'

export default function SignUp() {
  const router = useRouter();
  const { isConnected } = useAccount();
  const { openConnectModal } = useConnectModal();
  const searchParams = useSearchParams();

  const [mounted, setMounted] = useState(false);
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  useEffect(() => {
    setMounted(true); 
  }, []);

  useEffect(() => {
    if (!isConnected) {
      openConnectModal?.();
    }
    if(isConnected){
      router.replace(callbackUrl); 
    }
  }, [mounted, isConnected, router, callbackUrl, openConnectModal]);

  if (!mounted) return null; 

  return <div />;
}
