import React, { useEffect } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';

const CustomConnectButton = () => {
  const { address, isConnected } = useAccount();

  useEffect(() => {
    if (isConnected && address) {
      document.cookie = `walletAddress=${address}; path=/; SameSite=Lax`;
    }
  }, [isConnected, address]);

  return (
    <ConnectButton
      label="Login"
      chainStatus="none"
      showBalance={{
        smallScreen: false,
        largeScreen: true,
      }}
      accountStatus={{
        smallScreen: 'avatar',
        largeScreen: 'full',
      }}
    />
  );
};

export default CustomConnectButton;
