import { Abi, Hex, hexToNumber, parseEther, parseUnits } from "viem";
import {
  useAccount,
  usePublicClient,
  useWaitForTransactionReceipt,
  useWriteContract,
  useReadContract,
} from "wagmi";
import _ from "lodash";
import Marketplace from "@/utils/contracts/Marketplace.json";
import AdvancedERC1155 from "@/utils/contracts/AdvancedERC1155.json";
import { PinataFile } from "@/types";
import { useEffect, useState } from "react";
import { formattedPercentage } from "@/utils/ethUtils";
import useHandleFiles from "@/store/fileSlice";

interface IUseQuickListingModal {
  file: PinataFile;
  setClose: (value: boolean) => void;
}

export const useQuickListingModal = ({ file, setClose }: IUseQuickListingModal) => {
  const { updateFiles } = useHandleFiles();
  const { writeContract } = useWriteContract();
  const { address, chainId, chain } = useAccount();
  const publicClient = usePublicClient();
  const [royaltyPercentage, setRoyaltyPercentage] = useState<number>(0);
  const [maxTokenForListing, setMaxTokenForListing] = useState<number>(0);

  const contractAddress = process.env.NEXT_PUBLIC_MARKETPLACE_ADDRESS;

 
  const { data: currentSupply } = useReadContract({
    address: file.tokenAddress as `0x${string}`,
    abi: AdvancedERC1155.abi,
    functionName: "totalSupply",
    args: [BigInt(file.tokenId)],
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
  const handleSetQuickListing = async (price, amount) => {
    if (
      _.isEmpty(file.tokenId) &&
      _.isEmpty(file.tokenAddress) &&
      _.isEmpty(file.transactionHash)
    ) {
      return "Mint Token First";
    }
    const priceInWei = parseUnits(price.toString(), 18);
    writeContract(
      {
        abi: Marketplace.abi as Abi,
        account: address,
        address: contractAddress,
        functionName: "listItem",
        args: [
          file.tokenAddress,
          BigInt(file.tokenId),
          BigInt(amount),
          BigInt(priceInWei),
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
              price: price,
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
    handleSetQuickListing,
  };
};
