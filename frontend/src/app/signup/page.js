"use client";
import { useEffect, useState } from "react";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi"; 
import { useRouter, useSearchParams  } from 'next/navigation';
import Loader from '@/components/loader';
export default function SignUp() {
  const router = useRouter();
  const { isConnected } = useAccount();
  const { openConnectModal } = useConnectModal();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setMounted(true); 
  }, []);

  useEffect(() => {
    if (!isConnected) {
      openConnectModal?.();
    }
    if(isConnected){
      setLoading(true);
      router.replace(callbackUrl); 
    }
  }, [mounted, isConnected, router, callbackUrl, openConnectModal]);

  if (!mounted) return null; 

  return (
    <div className="flex items-center justify-center h-screen">
      {loading ? (
        <Loader />
      ) : null}
    </div>
  );
}
