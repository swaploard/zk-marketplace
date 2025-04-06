import { Abi, Hex, hexToNumber, parseEther, parseUnits } from "viem";
import {
  useAccount,
  usePublicClient,
  useWaitForTransactionReceipt,
  useWriteContract,
  useReadContract,
} from "wagmi";
import _ from "lodash";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import Marketplace from "@/utils/contracts/Marketplace.json";
import AdvancedERC1155 from "@/utils/contracts/AdvancedERC1155.json";
import { PinataFile } from "@/types";
import { formattedPercentage } from "@/utils/ethUtils";
import useHandleFiles from "@/store/fileSlice";
import { reduceEth } from "@/utils/ethUtils";
import useAuctionStore from "@/store/auctionSlice";
import { IAuctionStore } from "@/types";
interface IUseQuickListingModal {
  file: PinataFile;
  setClose: (value: boolean) => void;
}

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
  const listingFormSchema = z.object({
    amount: z.coerce
      .number()
      .min(1, { message: "Must be at least 1" })
      .max(maxTokenForListing, {
        message: `Must be less than ${maxTokenForListing}`,
      })
      .refine((val) => val > 0, {
        message: "amount must be a positive number",
      }),
    price: z.coerce
      .number()
      .min(0.0000000001, { message: "Must be at least 1" })
      .refine((val) => val > 0, {
        message: "Price must be a positive number",
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
    functionName: "totalSupply",
    args: [Number(file.tokenId)],
  });

  const { data } = useReadContract({
    address: file.tokenAddress as `0x${string}`,
    abi: AdvancedERC1155.abi,
    functionName: "royaltyInfo",
    args: [file.tokenId, parseEther("0.01")],
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

  const handleSetQuickListing = async (data) => {
    const priceInWei = parseUnits(data.price.toString(), 18);
    if (
      _.isEmpty(file.tokenId) &&
      _.isEmpty(file.tokenAddress) &&
      _.isEmpty(file.transactionHash)
    ) {
      return "Mint Token First";
    }
    writeContract(
      {
        abi: Marketplace.abi as Abi,
        account: address,
        address: contractAddress as `0x${string}`,
        functionName: "listItem",
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
        onSuccess: async (data) => {
          const receipt = await publicClient.waitForTransactionReceipt({
            hash: data,
          });
          if (receipt.status.toLowerCase() === "success") {
            await updateFiles({
              tokenId: file.tokenId,
              price: data.price,
            });
            setClose(false);
          }
        },
        onError: (error) => {
          console.log("error", error);
        },
      },
    );
  };

  return {
    royaltyPercentage,
    maxTokenForListing,
    quickListingForm,
    handleSetQuickListing,
  };
};

interface IUseQuickAuctionModal {
  file?: PinataFile;
  setClose?: (value: boolean) => void;
}

export const useQuickAuctionModal = ({
  file,
  setClose,
}: IUseQuickAuctionModal = {}) => {
  const { writeContract } = useWriteContract();
  const { address, chainId, chain } = useAccount();
  const { createAuction } = useAuctionStore((state: IAuctionStore) => state);

  const { updateFiles } = useHandleFiles();
  const [endDate, setEndDate] = useState("");
  const [endTime, setEndTime] = useState("");
  const [earnings, setEarnings] = useState(0);
  const [maxTokenForListing, setMaxTokenForListing] = useState<number>(0);
  const [royaltyPercentage, setRoyaltyPercentage] = useState<number>(0);
  const publicClient = usePublicClient();
  const auctionFormSchema = z.object({
    amount: z.coerce
      .number()
      .min(1, { message: "Must be at least 1" })
      .max(maxTokenForListing, {
        message: `Must be less than ${maxTokenForListing}`,
      })
      .refine((val) => val > 0, {
        message: "amount must be a positive number",
      }),
    price: z.coerce
      .number()
      .min(0.0000000001, { message: "Must be at least 1" })
      .refine((val) => val > 0, {
        message: "Price must be a positive number",
      }),
    duration: z.enum(["1 day", "3 days", "1 week", "1 month", "3 months"]),
  });
  const calculateEndDateTime = (duration: string) => {
    const now = new Date();
    let endDate = new Date(now);

    switch (duration) {
      case "1 day":
        endDate.setDate(now.getDate() + 1);
        break;
      case "3 days":
        endDate.setDate(now.getDate() + 3);
        break;
      case "1 week":
        endDate.setDate(now.getDate() + 7);
        break;
      case "1 month":
        endDate.setMonth(now.getMonth() + 1);
        break;
      case "3 months":
        endDate.setMonth(now.getMonth() + 3);
        break;
      default:
        break;
    }

    const year = endDate.getFullYear();
    const month = String(endDate.getMonth() + 1).padStart(2, "0");
    const day = String(endDate.getDate()).padStart(2, "0");
    const hours = String(endDate.getHours()).padStart(2, "0");
    const minutes = String(endDate.getMinutes()).padStart(2, "0");

    setEndDate(`${year}-${month}-${day}`);
    setEndTime(`${hours}:${minutes}`);
  };

  const quickAuctionForm = useForm<z.infer<typeof auctionFormSchema>>({
    resolver: zodResolver(auctionFormSchema),
    defaultValues: {
      amount: 1,
      price: 0,
      duration: "1 day",
    },
  });

  const contractAddress = process.env.NEXT_PUBLIC_MARKETPLACE_ADDRESS;

  const { data: currentSupply } = useReadContract({
    address: file.tokenAddress as `0x${string}`,
    abi: AdvancedERC1155.abi,
    functionName: "totalSupply",
    args: [Number(file.tokenId)],
  });

  const { data } = useReadContract({
    address: file.tokenAddress as `0x${string}`,
    abi: AdvancedERC1155.abi,
    functionName: "royaltyInfo",
    args: [file.tokenId, parseEther("0.01")],
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
    calculateEndDateTime(quickAuctionForm.getValues("duration"));

    const subscription = quickAuctionForm.watch((value, { name }) => {
      if (name === "duration" || !name) {
        calculateEndDateTime(value.duration || "1 day");
      }
    });
    return () => subscription.unsubscribe();
  }, [quickAuctionForm.watch]);

  useEffect(() => {
    const calculatedEarnings = reduceEth(
      royaltyPercentage,
      Number(quickAuctionForm.watch("price")),
    );
    setEarnings(calculatedEarnings);
  }, [quickAuctionForm.getValues("price")]);

  useEffect(() => {
    publicClient.watchContractEvent({
      abi: Marketplace.abi as Abi,
      address: contractAddress as `0x${string}`,
      poll: true,
      pollingInterval: 500,
      eventName: "AuctionCreated",
      fromBlock: BigInt(19637210),
      onLogs(logs) {
        const auctionCreated = logs[0]?.args;
        const auction = {
          auctionId: Number(auctionCreated.auctionId),
          marketplaceOwnerAddress: auctionCreated.seller,
          tokenAddress: auctionCreated.tokenAddress,
          tokenId: Number(auctionCreated.tokenId),
          amount: Number(auctionCreated.amount),
          startingPrice: Number(auctionCreated.startingPrice),
          duration: Number(auctionCreated.duration),
        };
        handleCreateAuction(auction);
      },
      onError(error) {
        console.log("watchContractEvent", error);
      },
    });
  }, []);
  const handleCreateAuction = _.debounce((auction) => {
    createAuction(auction);
  }, 2000);

  const handleSetQuickAuction = (data) => {
    const priceInWei = parseUnits(data.price.toString(), 18);
    const endTimestamp = Math.floor(
      new Date(`${endDate}T${endTime}`).getTime() / 1000,
    );

    const currentTimestamp = Math.floor(Date.now() / 1000);
    const duration = endTimestamp - currentTimestamp;
    if (duration <= 0) {
      console.error("End time must be in the future");
      return;
    }
    writeContract(
      {
        abi: Marketplace.abi as Abi,
        account: address,
        address: contractAddress as `0x${string}`,
        functionName: "createAuction",
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
          const receipt = await publicClient.waitForTransactionReceipt({
            hash: transactionHash,
          });
          if (receipt.status.toLowerCase() === "success") {
            const body = {
              isActiveAuction: true,
              tokenId: file.tokenId,
              highestBid: data.price,
            };
            updateFiles(body);
            setClose(false);
          }
        },
        onError: (error) => {
          console.log("error", error);
        },
      },
    );
  };

  return {
    endDate,
    endTime,
    earnings,
    quickAuctionForm,
    setEndDate,
    setEndTime,
    handleSetQuickAuction,
  };
};
