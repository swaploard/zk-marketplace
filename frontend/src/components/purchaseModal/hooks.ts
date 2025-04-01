import { useWriteContract, useAccount } from "wagmi";
import Marketplace from "@/utils/contracts/Marketplace.json";
import { PinataFile } from "@/types"
interface IPurchaseModalHook {
    file?: PinataFile;
}
export const usePurchaseModal = ({file}: IPurchaseModalHook = {}) => {
      
    const { writeContract } = useWriteContract();
    const { address, chainId, chain } = useAccount();
     
    const handlePurchase = async (price) => {
        console.log("BigInt(file.tokenId)", Number(file.tokenId), price)
        await writeContract({
            address: process.env.NEXT_PUBLIC_MARKETPLACE_ADDRESS,
            abi: Marketplace.abi,
            functionName: "buyItem",
            account: address,
            chainId: chainId,
            chain: chain,
            args: [Number(file.tokenId), 1],
            value: price
          },{
            onSuccess: async (data) => {
                console.log("data", data)
            },
            onError: (error) => {
                console.log("error", error)
            }
          });
    }

    return{handlePurchase}
}