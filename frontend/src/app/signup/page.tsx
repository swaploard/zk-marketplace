"use client";
import { useEffect, useState } from "react";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import { useRouter, useSearchParams } from "next/navigation";
import Loader from "@/components/loader";
import userSlice, { IUserStore } from "../../store/userSlice";

export default function SignUp() {
  const router = useRouter();

  const { user, getUser } = userSlice((state: IUserStore) => state);

  const { isConnected, address } = useAccount();
  const { openConnectModal } = useConnectModal();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const handleAuth = async () => {
      if (!isConnected) {
        openConnectModal?.();
        return;
      }

      if (isConnected && address) {
        try {
          setLoading(true);
          await getUser(address);
          document.cookie = `walletAddress=${address}; path=/; SameSite=Lax`;
          router.replace(callbackUrl);
        } catch (error) {
          console.error("Error fetching user:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    handleAuth();
  }, [
    address,
    mounted,
    isConnected,
    router,
    callbackUrl,
    openConnectModal,
    getUser,
    user,
  ]);

  if (!mounted) return null;

  return (
    <div className="flex items-center justify-center h-screen">
      {loading ? <Loader /> : null}
    </div>
  );
}
