'use client';
import { useEffect, useState } from 'react';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import { useRouter, useSearchParams } from 'next/navigation';
import Loader from '@/components/loader';

export default function SignUp() {
  const router = useRouter();
  const { isConnected, address } = useAccount();
  const { openConnectModal } = useConnectModal();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleAuth = async () => {
      if (!isConnected && openConnectModal) {
        openConnectModal();
      }
      if (isConnected && address) {
        setLoading(true);
        document.cookie = `walletAddress=${address}; path=/; SameSite=Lax; expires=${new Date(Date.now() + 24 * 60 * 60 * 1000).toUTCString()}`;
        router.replace(callbackUrl);
      }
    };
    handleAuth();
  }, [isConnected, address, openConnectModal, router, callbackUrl]);
  useEffect(() => {
    if (!isConnected && openConnectModal) {
      const timer = setInterval(() => {
        openConnectModal();
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isConnected, openConnectModal]);
  return (
    <div className="flex items-center justify-center h-screen">
      {loading ? <Loader /> : null}
      {!isConnected && (
        <div className="text-center">
          <h2 className="text-xl mb-4">
            Please connect your wallet to continue
          </h2>
        </div>
      )}
    </div>
  );
}
