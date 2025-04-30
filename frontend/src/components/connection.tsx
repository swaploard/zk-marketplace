import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAccount } from 'wagmi';

export default function RequireWallet({
  children,
  callbackUrl = '/',
}: {
  children: React.ReactNode;
  callbackUrl?: string;
}) {
  const { isConnected, isConnecting } = useAccount();
  const router = useRouter();

  useEffect(() => {
    if (!isConnecting && !isConnected) {
      const encodedCallback = encodeURIComponent(callbackUrl);
      router.push(`/signup?callbackUrl=${encodedCallback}`);
    }
  }, [isConnected, isConnecting, callbackUrl, router]);

  if (!isConnected) return null;

  return <>{children}</>;
}
