'use client';
import { useEffect, useState } from 'react';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import { useAccount, useSignMessage } from 'wagmi';
import { useRouter, useSearchParams } from 'next/navigation';
import Loader from '@/components/loader';

export default function SignUp() {
  const router = useRouter();
  const { isConnected, address } = useAccount();
  const { openConnectModal } = useConnectModal();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';
  const [loading, setLoading] = useState(false);

  const { signMessage } = useSignMessage({
    mutation: {
      onSettled(data, error) {
        if (error) {
          console.error('Error signing message:', error);
          setLoading(false);
          return;
        }
        try {
          document.cookie = `walletAddress=${address}; path=/; SameSite=Lax`;
          document.cookie = `signature=${data}; path=/; SameSite=Lax`;
          router.replace(callbackUrl);
        } catch (error) {
          console.error('Error during signature process:', error);
          setLoading(false);
        }
      },
    },
  });

  useEffect(() => {
    const handleAuth = async () => {
      if (!isConnected && openConnectModal) {
        openConnectModal();
        return;
      }
      if (isConnected && address) {
        try {
          setLoading(true);
          const message = `Welcome to ZK Marketplace!\n\nPlease sign this message to authenticate.\n\nWallet: ${address}\nTimestamp: ${Date.now()}`;
          signMessage({
            message,
            account: address,
          });
        } catch (error) {
          console.error('Error during authentication:', error);
          setLoading(false);
        }
      }
    };
    handleAuth();
  }, [isConnected, address, signMessage, openConnectModal]);

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
