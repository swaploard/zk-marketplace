import { HelpCircle, X } from "lucide-react";
import {
  useReadContract,
  useAccount,
  useWriteContract,
  usePublicClient,
} from "wagmi";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { PinataFile, StepStatus } from "@/types";
import Image from "next/image";
import { Input } from "../ui/input";
import Marketplace from "@/utils/contracts/Marketplace.json";
import AdvancedERC1155 from "@/utils/contracts/AdvancedERC1155.json";
import { useEffect, useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import _ from "lodash";
import { Abi, formatEther, parseEther, parseUnits } from "viem";
import { formattedPercentage } from "@/utils/ethUtils";
import useAuctionStore from "@/store/auctionSlice";
import useHandleFiles from "@/store/fileSlice";
import { IAuctionStore, Step } from "@/types";
import Stepper from "../steppers/createNftStepper";
interface IBidModalProps {
  setClose?: (value: boolean) => void;
  handleEthToUsd?: (value: number) => number;
  fileForListing?: PinataFile;
}

export const biddingSteps = [
  {
    title: "Go to your wallet to approve this transaction",
    description: "A blockchain transaction is required to place your bid.",
    status: "pending" as const,
  },
  {
    title: "Placing your bid",
    description: "Please stay on this page and keep this browser tab open.",
    status: "pending" as const,
  },
]

const BidModal = ({
  setClose,
  handleEthToUsd,
  fileForListing,
}: IBidModalProps = {}) => {
  const MarketplaceAddress = process.env
    .NEXT_PUBLIC_MARKETPLACE_ADDRESS as `0x${string}`;
  const { chainId, address, chain } = useAccount();
  const { writeContractAsync } = useWriteContract();
  const publicClient = usePublicClient();
  const {auction, getAuction } = useAuctionStore((state: IAuctionStore) => state);
  const {updateFiles} = useHandleFiles();
  const [amount, setAmount] = useState(0);
  const [royalties, setRoyalties] = useState(0);
  const [highestBid, setHighestBid] = useState(0);
  const [steps, setSteps] = useState<Step[]>(biddingSteps);
  const [showStepper, setShowStepper] = useState(false);

  const bidFormSchema = z.object({
    price: z.coerce
      .number()
      .min(highestBid, {
        message: `Must be greater than ${highestBid}`,
      })
      .refine((val) => val > fileForListing.highestBid, {
        message: `Must be greater than ${highestBid}`,
      }),
  });

  const bidForm = useForm<z.infer<typeof bidFormSchema>>({
    resolver: zodResolver(bidFormSchema),
    defaultValues: {
      price: 0,
    },
  });

  const updateStepStatus = (stepIndex: number, newStatus: StepStatus) => {
    setSteps((prev) =>
      prev.map((step, index) =>
        index === stepIndex ? { ...step, status: newStatus } : step,
      ),
    );
  };
  
  const { data: auctionData } = useReadContract({
    address: MarketplaceAddress,
    abi: Marketplace.abi,
    functionName: "auctions",
    args: [Number(auction?.auctionId)],
    chainId: chainId,
    account: address,
    query: {
      enabled: true,
    },
  });
  const { data: royalty } = useReadContract({
    address: fileForListing.tokenAddress as `0x${string}`,
    abi: AdvancedERC1155.abi,
    functionName: "royaltyInfo",
    args: [fileForListing.tokenId, parseEther("0.01")],
    query: {
      enabled: !!fileForListing.tokenAddress,
    },
   });

  useEffect(() => {
    getAuction(fileForListing._id);
  }, []);

  useEffect(() => {
    if (auctionData) {
      setAmount(Number(auctionData[4]));
      const latestBid = formatEther(auctionData[6]);
      const startingPrice = formatEther(auctionData[5]);
      if(Number(latestBid) === 0){
        setHighestBid(Number(startingPrice));
      }
      setHighestBid(Number(latestBid));
    }
    if (royalty) {
      const royaltiesPercentage = formattedPercentage(royalty[1]);
      setRoyalties(royaltiesPercentage);
    }
  }, [auctionData]);

  const handleBidding = async (data) => {
    setShowStepper(true);
    updateStepStatus(0, "current")
    try {
      await writeContractAsync(
        {
          abi: Marketplace.abi as Abi,
          account: address,
          address: MarketplaceAddress,
          functionName: "placeBid",
          args: [Number(auctionData[0])],
          value: BigInt(parseEther(data.price.toString())),
          chainId: chainId,
          chain: chain,
        },
        {
          onSuccess: async (transactionHash) => { 
            updateStepStatus(0, "completed");
            updateStepStatus(1, "current");
            const receipt = await publicClient.waitForTransactionReceipt({
              hash: transactionHash,
            });
            if (receipt.status.toLowerCase() === "success") {
              updateStepStatus(1, "completed");
              const body = {
                tokenId: String(auction.tokenId),
                highestBid: data.price.toString(),
                highestBidder: address
              }
              await updateFiles(body);
              setClose(false);
              setShowStepper(false);
            }
          },
          onError: (error) => {
            console.error("error", error);
            setShowStepper(false);
          },
        },
      );
    } catch (error) {
      console.error(error);
      setShowStepper(false);
    }
  };
  return (
    <div className="flex items-center justify-center bg-black/80 z-50 min-w-full min-h-full fixed inset-0">
       {showStepper && <Stepper steps={steps} />}
      <Card className="w-[550px] bg-[#1a1a1a]  text-white border-none shadow-xl">
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <div className="flex items-center ml-auto left-auto">
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-400 hover:text-white"
              onClick={() => setClose && setClose(false)}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>
        <div className="flex items-center gap-4 p-4">
          <div className="relative w-16 h-16 overflow-hidden rounded-lg">
            {fileForListing.AssetIpfsHash && (
              <Image
                src={`https://silver-rainy-chipmunk-430.mypinata.cloud/ipfs/${fileForListing.AssetIpfsHash}`}
                alt="NFT Image"
                width={64}
                height={64}
                className="object-cover bg-blue-600"
              />
            )}
          </div>
          <div>
            <h3 className="text-lg font-medium">
              {fileForListing.KeyValues.name}
            </h3>
            <p className="text-sm text-gray-400">based editions</p>
          </div>
          <div className="ml-auto text-right">
            <p className="text-sm text-gray-400">Listing price per item</p>
            <p className="font-medium">
              {!_.isEmpty(bidForm.getValues("price"))
                ? `${bidForm.getValues("price")} ETH`
                : "-- ETH"}
            </p>
            {bidForm.watch("price") && (
              <span className="text-sm text-gray-400">
                ${handleEthToUsd(Number(bidForm.watch("price"))).toFixed(2)} USD
              </span>
            )}
          </div>
        </div>
        <CardContent className="p-0 max-h-96 overflow-y-auto">
          <form onSubmit={bidForm.handleSubmit(handleBidding)}>
            <div className="p-4 space-y-6">
              {/* NFT Item */}

              {/* Price Setting */}
              <div className="">
                <div className="my-4">
                  <p className="mb-1 text-base font-medium"># of items</p>
                  <Input
                    type="number"
                    placeholder="Amount"
                    className="rounded-[15px] bg-[#2a2a2a] border-white focus-visible:ring-0 text-[150px] h-16 min-h-16 my-2"
                    value={amount}
                  />
                </div>
                <div className="flex items-center gap-1 mb-2">
                  <h3 className="text-base font-medium">
                    Set a price per item
                  </h3>
                  <Button variant="ghost" size="icon" className="w-5 h-5 p-0">
                    <HelpCircle className="w-4 h-4 text-gray-400" />
                  </Button>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="mb-2 text-base font-medium">Starting price</p>
                    <div className="flex">
                      <Input
                        type="number"
                        step={0.0000000001}
                        placeholder="Price"
                        className="rounded-l-[15px] bg-[#2a2a2a] border-white focus-visible:ring-0 text-[150px] h-16 min-h-16"
                        {...bidForm.register("price")}
                      />
                      <div className="flex items-center justify-center px-4 font-medium bg-[#2a2a2a] border border-l-0 border-white rounded-r-[15px]">
                        ETH
                      </div>
                    </div>
                    <div className="flex flex-row justify-between px-2">
                      {bidForm.formState.errors.price && (
                        <p className="text-red-500 text-sm mt-1">
                          {bidForm.formState.errors.price.message}
                        </p>
                      )}
                      {bidForm.watch("price") && (
                        <span className="text-sm text-gray-400 left-auto ml-auto mt-1">
                          $
                          {handleEthToUsd(
                            Number(bidForm.watch("price")),
                          ).toFixed(2)}{" "}
                          USD
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between my-5 border-b-2 border-b-gray-600 pb-4">
                  <div className="flex">
                    <h3 className="text-base font-medium">Bidding price</h3>
                  </div>
                  <div>
                    {" "}
                    {!_.isEmpty(bidForm.getValues("price"))
                      ? `${bidForm.getValues("price")} ETH`
                      : "--ETH"}
                  </div>
                </div>

                <div className="flex items-center justify-between my-5 border-b-2 border-b-gray-600 pb-4">
                  <div className="flex">
                    <h3 className="text-b.ase font-medium">Creator earnings</h3>
                    <Button variant="ghost" size="icon" className="w-5 h-5 p-0">
                      <HelpCircle className="w-4 h-4 text-gray-400" />
                    </Button>
                  </div>
                  <div> {royalties}% </div>
                </div>
              </div>
            </div>

            {/* Complete Button */}
            <div className="p-4 pt-2">
              <Button
                className="w-full bg-slate-700 hover:bg-slate-600z text-primary-foreground"
                type="submit"
              >
                Complete Bidding
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default BidModal;
