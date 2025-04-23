import { useWriteContract, useAccount, usePublicClient } from 'wagmi';
import Marketplace from '@/utils/contracts/Marketplace.json';
import { PinataFile, Step, StepStatus } from '@/types';
import useHandleFiles from '@/store/fileSlice';
import { useState } from 'react';
interface IPurchaseModalHook {
  file?: PinataFile;
  setClose?: (value: boolean) => void;
}

export const purchaseSteps = [
  {
    title: 'Go to your wallet to approve this transaction',
    description: 'A blockchain transaction is required to buy NFT.',
    status: 'pending' as const,
  },
  {
    title: 'Purchasing is in progress',
    description: 'Please stay on this page and keep this browser tab open.',
    status: 'pending' as const,
  },
];
export const usePurchaseModal = ({
  file,
  setClose,
}: IPurchaseModalHook = {}) => {
  const { updateFiles, getFiles } = useHandleFiles();
  const publicClient = usePublicClient();
  const { writeContractAsync } = useWriteContract();
  const { address, chainId, chain } = useAccount();
  const [steps, setSteps] = useState<Step[]>(purchaseSteps);
  const [showStepper, setShowStepper] = useState(false);

  // const { data: getListing } = useReadContract({
  //   address: process.env.NEXT_PUBLIC_MARKETPLACE_ADDRESS as `0x${string}`,
  //   abi: Marketplace.abi,
  //   functionName: 'getListing',
  //   args: [Number(file.tokenId)],
  //   query: {
  //     enabled: !!file.tokenAddress,
  //   },
  // });

  const updateStepStatus = (stepIndex: number, newStatus: StepStatus) => {
    setSteps((prev) =>
      prev.map((step, index) =>
        index === stepIndex ? { ...step, status: newStatus } : step
      )
    );
  };

  const handlePurchase = async (price: bigint) => {
    try {
      setShowStepper(true);
      updateStepStatus(0, 'current');
      if (!address || !file?.tokenId) {
        throw new Error('Missing wallet address or token ID');
      }

      const transactionHash = await writeContractAsync({
        address: process.env.NEXT_PUBLIC_MARKETPLACE_ADDRESS as `0x${string}`,
        abi: Marketplace.abi,
        functionName: 'buyItem',
        account: address,
        args: [Number(file.tokenId), 1],
        value: price,
        chainId: chainId,
        chain: chain,
      });
      updateStepStatus(0, 'completed');
      updateStepStatus(1, 'current');

      const receipt = await publicClient.waitForTransactionReceipt({
        hash: transactionHash,
      });

      if (receipt.status === 'success') {
        updateStepStatus(1, 'completed');
        await updateFiles({
          tokenId: String(file._id),
          isListed: false,
          walletAddress: address,
          price: 0,
        });
        setClose?.(false);
        setShowStepper(false);
        getFiles(file.tokenAddress, '');
      } else {
        console.error('Transaction reverted');
        setClose?.(false);
        setShowStepper(false);
      }
    } catch (error) {
      console.error('Purchase failed:', error);
      setClose?.(false);
      setShowStepper(false);
    }
  };

  return { steps, showStepper, handlePurchase };
};
