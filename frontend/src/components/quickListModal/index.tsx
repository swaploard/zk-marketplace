"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { X, HelpCircle, ChevronUp } from "lucide-react";
import Image from "next/image";
import _ from "lodash";
import { PinataFile } from "@/types";
import Stepper from "@/components/steppers/createNftStepper";
import { useQuickListingModal, useQuickAuctionModal } from "./hook";

interface QuickListingModalProps {
  setClose: (value: boolean) => void;
  handleEthToUsd: (value: number) => number;
  fileForListing: PinataFile;
}

export default function QuickListingModal({
  setClose,
  handleEthToUsd,
  fileForListing,
}: QuickListingModalProps) {
  const {
    steps,
    showStepper,
    royaltyPercentage,
    maxTokenForListing,
    disableButton,
    handleSetQuickListing,
    quickListingForm,
  } = useQuickListingModal({
    file: fileForListing,
    setClose,
  });
  const {
    earnings,
    endDate,
    endTime,
    quickAuctionForm,
    steps: auctionsSteps,
    showStepper: showAuctionsStepper,
    setEndDate,
    setEndTime,
    handleSetQuickAuction,
  } = useQuickAuctionModal({
    file: fileForListing,
    setClose,
  });

  return (
    <div className="flex items-center justify-center bg-black/80 z-50 min-w-full min-h-full fixed inset-0">
      {showStepper ? <Stepper steps={steps} /> : showAuctionsStepper ? <Stepper steps={auctionsSteps} /> : <></>}
      <Tabs defaultValue="listing" className="">
        <Card className="w-[550px] bg-[#1a1a1a]  text-white border-none shadow-xl">
          <div className="flex items-center justify-between p-4 border-b border-gray-800">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="listing">Quick list</TabsTrigger>
              <TabsTrigger value="auction">Auction</TabsTrigger>
            </TabsList>
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-400 hover:text-white"
                onClick={() => setClose(false)}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>

          <TabsContent
            value="listing"
            className="h-[410px] w-[550px] overflow-y-auto"
          >
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
                  {!_.isEmpty(quickListingForm.getValues("price"))
                    ? `${quickListingForm.getValues("price")} ETH`
                    : "-- ETH"}
                </p>
                {quickListingForm.watch("price") && (
                  <span className="text-sm text-gray-400">
                    $
                    {handleEthToUsd(
                      Number(quickListingForm.watch("price")),
                    ).toFixed(2)}{" "}
                    USD
                  </span>
                )}
              </div>
            </div>
            <CardContent className="p-0">
              <form
                onSubmit={quickListingForm.handleSubmit(handleSetQuickListing)}
              >
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
                        {...quickListingForm.register("amount", {
                          valueAsNumber: true,
                        })}
                      />
                      {quickListingForm.formState.errors.amount ? (
                        <p className="text-red-500 text-sm mt-1">
                          {quickListingForm.formState.errors.amount.message}
                        </p>
                      ) : (
                        <p className="text-sm text-gray-400 ml-auto w-fit">
                          available: {maxTokenForListing}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-1 mb-2">
                      <h3 className="text-base font-medium">
                        Set a price per item
                      </h3>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-5 h-5 p-0"
                      >
                        <HelpCircle className="w-4 h-4 text-gray-400" />
                      </Button>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <p className="mb-2 text-base font-medium">
                          Starting price
                        </p>
                        <div className="flex">
                          <Input
                            type="number"
                            step={0.0000000001}
                            placeholder="Price"
                            className="rounded-l-[15px] bg-[#2a2a2a] border-white focus-visible:ring-0 text-[150px] h-16 min-h-16"
                            {...quickListingForm.register("price")}
                          />
                          <div className="flex items-center justify-center px-4 font-medium bg-[#2a2a2a] border border-l-0 border-white rounded-r-[15px]">
                            ETH
                          </div>
                        </div>
                        <div className="flex flex-row justify-between px-2">
                          {quickListingForm.formState.errors.price && (
                            <p className="text-red-500 text-sm mt-1">
                              {quickListingForm.formState.errors.price.message}
                            </p>
                          )}
                          {quickListingForm.watch("price") && (
                            <span className="text-sm text-gray-400 left-auto ml-auto mt-1">
                              $
                              {handleEthToUsd(
                                Number(quickListingForm.watch("price")),
                              ).toFixed(2)}{" "}
                              USD
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between my-5 border-b-2 border-b-gray-600 pb-4">
                      <div className="flex">
                        <h3 className="text-base font-medium">Listing price</h3>
                      </div>
                      <div>
                        {" "}
                        {!_.isEmpty(quickListingForm.getValues("price"))
                          ? `${quickListingForm.getValues("price")} ETH`
                          : "--ETH"}
                      </div>
                    </div>

                    <div className="flex items-center justify-between my-5 border-b-2 border-b-gray-600 pb-4">
                      <div className="flex">
                        <h3 className="text-b.ase font-medium">
                          Creator earnings
                        </h3>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="w-5 h-5 p-0"
                        >
                          <HelpCircle className="w-4 h-4 text-gray-400" />
                        </Button>
                      </div>
                      <div> {royaltyPercentage}% </div>
                    </div>
                    <div className="flex items-center justify-between my-5 pb-4">
                      <div className="flex">
                        <h3 className="text-base font-medium">
                          Total potential earnings
                        </h3>
                      </div>
                      <div className="flex flex-col">
                        <div className="">
                          {earnings ? `${earnings} ETH` : "--ETH"}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Complete Button */}
                <div className="p-4 pt-2">
                  <Button
                    className={`w-full ${
                      disableButton ? "bg-slate-400 cursor-not-allowed" : "bg-slate-700 hover:bg-slate-600"
                    } text-primary-foreground`}
                    type="submit"
                    disabled={disableButton}
                  >
                    Complete listing
                  </Button>
                </div>
              </form>
            </CardContent>
          </TabsContent>
          <TabsContent value="auction" className="h-[410px] w-[550px]">
            <CardContent className="p-0 max-h-96 overflow-y-auto">
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
                  <p className="text-sm text-gray-400">
                    Listing price per item
                  </p>
                  <p className="font-medium">
                    {!_.isEmpty(quickAuctionForm.getValues("price"))
                      ? `${quickAuctionForm.getValues("price")} ETH`
                      : "-- ETH"}
                  </p>
                  {quickAuctionForm.watch("price") && (
                    <span className="text-sm text-gray-400">
                      $
                      {handleEthToUsd(
                        Number(quickAuctionForm.watch("price")),
                      ).toFixed(2)}{" "}
                      USD
                    </span>
                  )}
                </div>
              </div>
              <form
                className="mx-auto p-4 space-y-6"
                onSubmit={quickAuctionForm.handleSubmit(handleSetQuickAuction)}
              >
                <div className="space-y-6">
                  {/* Method Selection */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium">Method</label>
                      <HelpCircle className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <Select defaultValue="highest-bidder">
                      <SelectTrigger>
                        <SelectValue placeholder="Select method" />
                      </SelectTrigger>
                      <SelectContent className="bg-black">
                        <SelectItem value="top-bidder">
                          Sell to highest bidder
                        </SelectItem>
                        <SelectItem value="highest-bidder">
                          Sell with declining price
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="my-4">
                    <p className="mb-1 text-base font-medium"># of items</p>
                    <Input
                      type="number"
                      placeholder="Amount"
                      className="rounded-[15px] bg-[#2a2a2a] border-white focus-visible:ring-0 text-[150px] h-16 min-h-16 my-2"
                      {...quickAuctionForm.register("amount", {
                        valueAsNumber: true,
                      })}
                    />
                    {quickAuctionForm.formState.errors.amount ? (
                      <p className="text-red-500 text-sm mt-1">
                        {quickAuctionForm.formState.errors.amount.message}
                      </p>
                    ) : (
                      <p className="text-sm text-gray-400 ml-auto w-fit">
                        available: {maxTokenForListing}
                      </p>
                    )}
                  </div>
                  {/* Starting Price */}
                  <div className="space-y-4">
                    <div>
                      <p className="mb-2 text-base font-medium">
                        Starting price
                      </p>
                      <div className="flex">
                        <Input
                          type="number"
                          step={0.0000000001}
                          placeholder="Price"
                          className="rounded-l-[15px] bg-[#2a2a2a] border-white focus-visible:ring-0 text-[150px] h-16 min-h-16"
                          {...quickAuctionForm.register("price")}
                        />
                        <div className="flex items-center justify-center px-4 font-medium bg-[#2a2a2a] border border-l-0 border-white rounded-r-[15px]">
                          ETH
                        </div>
                      </div>
                      <div className="flex flex-row justify-between">
                        {quickAuctionForm.formState.errors.price && (
                          <p className="text-red-500 text-sm mt-1">
                            {quickAuctionForm.formState.errors.price.message}
                          </p>
                        )}
                        {
                          <span className="text-sm text-gray-400 left-auto ml-auto mt-1">
                            $
                            {handleEthToUsd(
                              Number(quickAuctionForm.watch("price")),
                            ).toFixed(2)}
                            USD
                          </span>
                        }
                      </div>
                    </div>
                  </div>

                  {/* Duration */}
                  <div>
                    <p className="mb-2 text-base font-medium">Duration</p>
                    <div className="flex">
                      <div className="mr-2 flex-1">
                        <Select
                          value={quickAuctionForm.watch("duration")}
                          onValueChange={(value) =>
                            quickAuctionForm.setValue("duration", value)
                          }
                        >
                          <SelectTrigger className="bg-[#2a2a2a] border-gray-700 focus:ring-0">
                            <SelectValue placeholder="Select duration" />
                          </SelectTrigger>
                          <SelectContent className="bg-[#2a2a2a] border-gray-700">
                            <SelectItem value="1 day">1 day</SelectItem>
                            <SelectItem value="3 days">3 days</SelectItem>
                            <SelectItem value="1 week">1 week</SelectItem>
                            <SelectItem value="1 month">1 month</SelectItem>
                            <SelectItem value="3 months">3 months</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <input
                        type="date"
                        value={endDate}
                        min={new Date().toISOString().split("T")[0]}
                        className="px-3 bg-[#2a2a2a] border-gray-700 outline-none"
                        onChange={(e) => setEndDate(e.target.value)}
                      />
                      <input
                        type="time"
                        value={endTime}
                        className="px-3 bg-[#2a2a2a] border-gray-700 outline-none"
                        onChange={(e) => setEndTime(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between my-5 border-b-2 border-b-gray-600 pb-4">
                    <div className="flex">
                      <h3 className="text-b.ase font-medium">
                        Creator earnings
                      </h3>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-5 h-5 p-0"
                      >
                        <HelpCircle className="w-4 h-4 text-gray-400" />
                      </Button>
                    </div>
                    <div> {royaltyPercentage}% </div>
                  </div>
                  <div className="flex items-center justify-between my-5 pb-4">
                    <div className="flex">
                      <h3 className="text-base font-medium">
                        Total potential earnings
                      </h3>
                    </div>
                    <div className="flex flex-col">
                      <div className="">
                        {earnings ? `${earnings} ETH` : "--ETH"}
                      </div>
                    </div>
                  </div>
                </div>
                {/* Complete Listing Button */}
                <Button
                  type="submit"
                  className="w-full bg-slate-700 hover:bg-slate-600z text-primary-foreground"
                >
                  Create auction
                </Button>
              </form>
            </CardContent>
          </TabsContent>
        </Card>
      </Tabs>
    </div>
  );
}
