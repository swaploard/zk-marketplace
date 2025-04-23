import { Abi, parseEther, parseUnits } from 'viem';
import {
  useAccount,
  usePublicClient,
  useWriteContract,
  useReadContract,
} from 'wagmi';
import _ from 'lodash';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import Marketplace from '@/utils/contracts/Marketplace.json';
import AdvancedERC1155 from '@/utils/contracts/AdvancedERC1155.json';
import { PinataFile, Step, StepStatus } from '@/types';
import { formattedPercentage } from '@/utils/ethUtils';
import useHandleFiles from '@/store/fileSlice';
import { reduceEth } from '@/utils/ethUtils';
import useAuctionStore from '@/store/auctionSlice';
import { IAuctionStore } from '@/types';
interface IUseQuickListingModal {
  file: PinataFile;
  setClose: (value: boolean) => void;
}

export const listingSteps = [
  {
    title: 'Go to your wallet to approve this transaction',
    description: 'A blockchain transaction is required to list your NFT.',
    status: 'pending' as const,
  },
  {
    title: 'Listing your item',
    description: 'Please stay on this page and keep this browser tab open.',
    status: 'pending' as const,
  },
];

export const useQuickListingModal = ({
  file,
  setClose,
}: IUseQuickListingModal) => {
  const { updateFiles } = useHandleFiles();
  const { writeContract } = useWriteContract();
  const { address, chainId, chain } = useAccount();
  const publicClient = usePublicClient();
  const [royaltyPercentage, setRoyaltyPercentage] = useState<number>(0);
  const [maxTokenForListing, setMaxTokenForListing] = useState<number>(0);
  const [steps, setSteps] = useState<Step[]>(listingSteps);
  const [showStepper, setShowStepper] = useState(false);
  const [disableButton, setDisableButton] = useState(true);
  const listingFormSchema = z.object({
    amount: z.coerce
      .number()
      .min(1, { message: 'Must be at least 1' })
      .max(maxTokenForListing, {
        message: `Must be less than ${maxTokenForListing}`,
      })
      .refine((val) => val > 0, {
        message: 'amount must be a positive number',
      }),
    price: z.coerce
      .number()
      .min(0.0000000001, { message: 'Must be at least 1' })
      .refine((val) => val > 0, {
        message: 'Price must be a positive number',
      }),
  });

  const quickListingForm = useForm<z.infer<typeof listingFormSchema>>({
    resolver: zodResolver(listingFormSchema),
    defaultValues: {
      amount: 1,
    },
  });

  const contractAddress = process.env.NEXT_PUBLIC_MARKETPLACE_ADDRESS;
  const { data: currentSupply } = useReadContract({
    address: file.tokenAddress as `0x${string}`,
    abi: AdvancedERC1155.abi,
    functionName: 'totalSupply',
    args: [Number(file.tokenId)],
  });

  const { data: isApproved } = useReadContract({
    address: file.tokenAddress as `0x${string}`,
    abi: AdvancedERC1155.abi,
    functionName: 'isApprovedForAll',
    args: [address, contractAddress],
  });
  const { data } = useReadContract({
    address: file.tokenAddress as `0x${string}`,
    abi: AdvancedERC1155.abi,
    functionName: 'royaltyInfo',
    args: [file.tokenId, parseEther('0.01')],
    query: {
      enabled: !!file.tokenAddress,
    },
  });

  useEffect(() => {
    if (data) {
      const royalties = formattedPercentage(data[1]);
      setRoyaltyPercentage(royalties);
    }
    if (currentSupply) {
      setMaxTokenForListing(Number(currentSupply));
    }
  }, [data, currentSupply]);

  useEffect(() => {
    if (isApproved) {
      setDisableButton(false);
      return;
    }

    setDisableButton(true);
    const approveTransfer = () => {
      if (!isApproved && isApproved != undefined) {
        writeContract(
          {
            abi: AdvancedERC1155.abi as Abi,
            account: address,
            address: file.tokenAddress as `0x${string}`,
            functionName: 'setApprovalForAll',
            args: [contractAddress, true],
            chainId: chainId,
            chain: chain,
          },
          {
            onSuccess: async (transactionHash) => {
              const receipt = await publicClient.waitForTransactionReceipt({
                hash: transactionHash,
              });
              if (receipt.status.toLowerCase() === 'success') {
                setDisableButton(false);
              }
            },
            onError: (error) => {
              console.log('onError', error);
            },
          }
        );
      }
    };
    approveTransfer();
  }, [isApproved]);

  const updateStepStatus = (stepIndex: number, newStatus: StepStatus) => {
    setSteps((prev) =>
      prev.map((step, index) =>
        index === stepIndex ? { ...step, status: newStatus } : step
      )
    );
  };

  const handleSetQuickListing = async (data) => {
    setShowStepper(true);
    updateStepStatus(0, 'current');
    const priceInWei = parseUnits(data.price.toString(), 18);
    if (
      _.isEmpty(file.tokenId) &&
      _.isEmpty(file.tokenAddress) &&
      _.isEmpty(file.transactionHash)
    ) {
      return 'Mint Token First';
    }
    writeContract(
      {
        abi: Marketplace.abi as Abi,
        account: address,
        address: contractAddress as `0x${string}`,
        functionName: 'listItem',
        args: [
          file.tokenAddress,
          Number(file.tokenId),
          Number(data.amount),
          Number(priceInWei),
        ],
        chainId: chainId,
        chain: chain,
      },
      {
        onSuccess: async (listingHash) => {
          updateStepStatus(0, 'completed');
          updateStepStatus(1, 'current');
          const receipt = await publicClient.waitForTransactionReceipt({
            hash: listingHash,
          });
          if (receipt.status.toLowerCase() === 'success') {
            updateStepStatus(1, 'completed');
            const updateBody = {
              tokenId: file._id,
              price: data.price,
              isListed: true,
            };
            await updateFiles(updateBody);
            setClose(false);
            setShowStepper(false);
          } else {
            setShowStepper(false);
            setClose(false);
          }
        },
        onError: (error) => {
          console.log('error', error);
          setShowStepper(false);
          setClose(false);
        },
      }
    );
  };

  return {
    steps,
    showStepper,
    royaltyPercentage,
    maxTokenForListing,
    quickListingForm,
    disableButton,
    handleSetQuickListing,
  };
};

interface IUseQuickAuctionModal {
  file?: PinataFile;
  setClose?: (value: boolean) => void;
}

export const auctionSteps = [
  {
    title: 'Go to your wallet to approve this transaction',
    description: 'A blockchain transaction is required to auction your NFT.',
    status: 'pending' as const,
  },
  {
    title: 'Placing your bid',
    description: 'Please stay on this page and keep this browser tab open.',
    status: 'pending' as const,
  },
];
export const useQuickAuctionModal = ({
  file,
  setClose,
}: IUseQuickAuctionModal = {}) => {
  const { writeContract } = useWriteContract();
  const { address, chainId, chain } = useAccount();
  const { createAuction } = useAuctionStore((state: IAuctionStore) => state);

  const { updateFiles } = useHandleFiles();
  const [endDate, setEndDate] = useState('');
  const [endTime, setEndTime] = useState('');
  const [earnings, setEarnings] = useState(0);
  const [maxTokenForListing, setMaxTokenForListing] = useState<number>(0);
  const [royaltyPercentage, setRoyaltyPercentage] = useState<number>(0);
  const [steps, setSteps] = useState<Step[]>(auctionSteps);
  const [showStepper, setShowStepper] = useState(false);
  const publicClient = usePublicClient();
  const auctionFormSchema = z.object({
    amount: z.coerce
      .number()
      .min(1, { message: 'Must be at least 1' })
      .max(maxTokenForListing, {
        message: `Must be less than ${maxTokenForListing}`,
      })
      .refine((val) => val > 0, {
        message: 'amount must be a positive number',
      }),
    price: z.coerce
      .number()
      .min(0.0000000001, { message: 'Must be at least 1' })
      .refine((val) => val > 0, {
        message: 'Price must be a positive number',
      }),
    duration: z.enum(['1 day', '3 days', '1 week', '1 month', '3 months']),
  });
  const calculateEndDateTime = (duration: string) => {
    const now = new Date();
    const endDate = new Date(now);

    switch (duration) {
      case '1 day':
        endDate.setDate(now.getDate() + 1);
        break;
      case '3 days':
        endDate.setDate(now.getDate() + 3);
        break;
      case '1 week':
        endDate.setDate(now.getDate() + 7);
        break;
      case '1 month':
        endDate.setMonth(now.getMonth() + 1);
        break;
      case '3 months':
        endDate.setMonth(now.getMonth() + 3);
        break;
      default:
        break;
    }

    const year = endDate.getFullYear();
    const month = String(endDate.getMonth() + 1).padStart(2, '0');
    const day = String(endDate.getDate()).padStart(2, '0');
    const hours = String(endDate.getHours()).padStart(2, '0');
    const minutes = String(endDate.getMinutes()).padStart(2, '0');

    setEndDate(`${year}-${month}-${day}`);
    setEndTime(`${hours}:${minutes}`);
  };

  const quickAuctionForm = useForm<z.infer<typeof auctionFormSchema>>({
    resolver: zodResolver(auctionFormSchema),
    defaultValues: {
      amount: 1,
      price: 0,
      duration: '1 day',
    },
  });

  const contractAddress = process.env.NEXT_PUBLIC_MARKETPLACE_ADDRESS;

  const { data: currentSupply } = useReadContract({
    address: file.tokenAddress as `0x${string}`,
    abi: AdvancedERC1155.abi,
    functionName: 'totalSupply',
    args: [Number(file.tokenId)],
  });

  const { data } = useReadContract({
    address: file.tokenAddress as `0x${string}`,
    abi: AdvancedERC1155.abi,
    functionName: 'royaltyInfo',
    args: [file.tokenId, parseEther('0.01')],
    query: {
      enabled: !!file.tokenAddress,
    },
  });

  useEffect(() => {
    if (data) {
      const royalties = formattedPercentage(data[1]);
      setRoyaltyPercentage(royalties);
    }
    if (currentSupply) {
      setMaxTokenForListing(Number(currentSupply));
    }
  }, [data, currentSupply]);

  useEffect(() => {
    calculateEndDateTime(quickAuctionForm.getValues('duration'));

    const subscription = quickAuctionForm.watch((value, { name }) => {
      if (name === 'duration' || !name) {
        calculateEndDateTime(value.duration || '1 day');
      }
    });
    return () => subscription.unsubscribe();
  }, [quickAuctionForm.watch, quickAuctionForm]);

  useEffect(() => {
    const currentPrice = quickAuctionForm.watch('price');
    const calculatedEarnings = reduceEth(
      royaltyPercentage,
      Number(currentPrice)
    );
    setEarnings(calculatedEarnings);
  }, [quickAuctionForm, royaltyPercentage]);

  const handleCreateAuction = _.debounce((auction) => {
    createAuction(auction);
  }, 2000);

  useEffect(() => {
    publicClient.watchContractEvent({
      abi: Marketplace.abi as Abi,
      address: contractAddress as `0x${string}`,
      poll: true,
      pollingInterval: 500,
      eventName: 'AuctionCreated',
      fromBlock: BigInt(19637210),
      onLogs(logs) {
        const auctionCreated = logs[0] as unknown as {
          args: {
            auctionId: bigint;
            seller: string;
            tokenAddress: string;
            tokenId: bigint;
            amount: bigint;
            startingPrice: bigint;
            duration: bigint;
          };
        };
        const auction = {
          file: file._id,
          auctionId: Number(auctionCreated.args.auctionId),
          marketplaceOwnerAddress: auctionCreated.args.seller,
          tokenAddress: auctionCreated.args.tokenAddress,
          tokenId: Number(auctionCreated.args.tokenId),
          amount: Number(auctionCreated.args.amount),
          startingPrice: Number(auctionCreated.args.startingPrice),
          duration: Number(auctionCreated.args.duration),
        };
        handleCreateAuction(auction);
      },
      onError(error) {
        console.log('watchContractEvent', error);
      },
    });
  }, [contractAddress, file._id, publicClient, handleCreateAuction]);

  const updateStepStatus = (stepIndex: number, newStatus: StepStatus) => {
    setSteps((prev) =>
      prev.map((step, index) =>
        index === stepIndex ? { ...step, status: newStatus } : step
      )
    );
  };
  const handleSetQuickAuction = (data) => {
    setShowStepper(true);
    updateStepStatus(0, 'current');
    const priceInWei = parseUnits(data.price.toString(), 18);
    const endTimestamp = Math.floor(
      new Date(`${endDate}T${endTime}`).getTime() / 1000
    );

    const currentTimestamp = Math.floor(Date.now() / 1000);
    const duration = endTimestamp - currentTimestamp;
    if (duration <= 0) {
      console.error('End time must be in the future');
      return;
    }
    writeContract(
      {
        abi: Marketplace.abi as Abi,
        account: address,
        address: contractAddress as `0x${string}`,
        functionName: 'createAuction',
        args: [
          file.tokenAddress,
          Number(file.tokenId),
          Number(data.amount),
          Number(priceInWei),
          duration,
        ],
        chainId: chainId,
        chain: chain,
      },
      {
        onSuccess: async (transactionHash) => {
          updateStepStatus(0, 'completed');
          updateStepStatus(1, 'current');
          const receipt = await publicClient.waitForTransactionReceipt({
            hash: transactionHash,
          });
          if (receipt.status.toLowerCase() === 'success') {
            updateStepStatus(1, 'completed');
            const body = {
              isActiveAuction: true,
              tokenId: file.tokenId,
              highestBid: data.price,
              isListed: true,
            };
            updateFiles(body);
            setShowStepper(false);
            setClose(false);
          } else {
            setShowStepper(false);
            setClose(false);
          }
        },
        onError: (error) => {
          console.log('error', error);
          setShowStepper(false);
        },
      }
    );
  };

  return {
    endDate,
    endTime,
    earnings,
    quickAuctionForm,
    steps,
    showStepper,
    setEndDate,
    setEndTime,
    handleSetQuickAuction,
  };
};
