import { useWriteContract, useAccount, useReadContract } from "wagmi";
import Marketplace from "@/utils/contracts/Marketplace.json";
import { PinataFile } from "@/types"
interface IPurchaseModalHook {
    file?: PinataFile;
    setClose?: (value: boolean) => void
}
export const usePurchaseModal = ({file, setClose}: IPurchaseModalHook = {}) => {
      
    const { writeContract } = useWriteContract();
    const { address, chainId, chain } = useAccount();

    const { data: getListing } = useReadContract({
        address: process.env.NEXT_PUBLIC_MARKETPLACE_ADDRESS as `0x${string}`,
        abi: Marketplace.abi,
        functionName: "getListing",
        args: [Number(file.tokenId)],
        query: {
          enabled: !!file.tokenAddress,
        },
      }); 
  
      const handlePurchase = async (price) => {
        await writeContract({
            address: process.env.NEXT_PUBLIC_MARKETPLACE_ADDRESS as `0x${string}`,
            abi: Marketplace.abi,
            functionName: "buyItem",
            account: address,
            chainId: chainId,
            chain: chain,
            args: [Number(file.tokenId), 1],
            value: price
          },{
            onSuccess: async (data) => {
                setClose(false)
            },
            onError: (error) => {
                console.log("error", error)
            }
          });
    }

    return{handlePurchase}
}