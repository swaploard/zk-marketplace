"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import { X, ExternalLink, HelpCircle } from "lucide-react";
import Image from "next/image";
import { PinataFile, Metadata } from "@/types";

const formSchema = z.object({
  amount: z.string().refine(
    (val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0,
    { message: "Amount must be a positive number" }
  ),
  duration: z.enum(["1 day", "3 days", "1 week", "1 month", "3 months"]),
});

interface QuickListingModalProps {
  setClose: (value: boolean) => void;
  updateFiles: (body: Metadata) => void;
  handleEthToUsd: (value: number) => number;
  fileForListing: PinataFile;
}

export default function QuickListingModal({
  setClose,
  updateFiles,
  handleEthToUsd,
  fileForListing,
}: QuickListingModalProps) {
  const [endDate, setEndDate] = useState("");
  const [endTime, setEndTime] = useState("");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: "",
      duration: "1 day", // Changed default to 1 day
    },
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

  useEffect(() => {
    calculateEndDateTime(form.getValues("duration"));
    
    const subscription = form.watch((value, { name }) => {
      if (name === "duration" || !name) {
        calculateEndDateTime(value.duration || "1 day");
      }
    });
    return () => subscription.unsubscribe();
  }, [form.watch]);

  const onSubmit = (data: z.infer<typeof formSchema>) => {

    const metadata = {
      cid: fileForListing.ipfs_pin_hash,
      keyValues: {
        amount: parseFloat(data.amount),
        duration: data.duration,
        endDate: endDate,
        endTime: endTime,
        ...fileForListing.metadata.keyvalues
      },
      name: fileForListing.metadata.name
    }
    updateFiles(metadata)
    console.log("metadata", metadata)
  };

  return (
    <div className="flex items-center justify-center bg-black/80 z-50 min-w-full min-h-full fixed inset-0">
      <Card className="w-full max-w-md bg-[#1a1a1a] text-white border-none shadow-xl">
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <h2 className="text-xl font-semibold">Quick list</h2>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-400 hover:text-white"
            >
              <ExternalLink className="w-5 h-5" />
            </Button>
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

        <CardContent className="p-0">
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="p-4 space-y-6">
              {/* NFT Item */}
              <div className="flex items-center gap-4">
                <div className="relative w-16 h-16 overflow-hidden rounded-lg">
                  {fileForListing.ipfs_pin_hash && (
                    <Image
                      src={`https://silver-rainy-chipmunk-430.mypinata.cloud/ipfs/${fileForListing.ipfs_pin_hash}`}
                      alt="NFT Image"
                      width={64}
                      height={64}
                      className="object-cover bg-blue-600"
                    />
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-medium">
                    {fileForListing.metadata.keyvalues.name}
                  </h3>
                  <p className="text-sm text-gray-400">based editions</p>
                </div>
                <div className="ml-auto text-right">
                  <p className="text-sm text-gray-400">Listing price per item</p>
                  <p className="font-medium">-- ETH</p>
                </div>
              </div>

              {/* Price Setting */}
              <div>
                <div className="flex items-center gap-1 mb-2">
                  <h3 className="text-base font-medium">Set a price per item</h3>
                  <Button variant="ghost" size="icon" className="w-5 h-5 p-0">
                    <HelpCircle className="w-4 h-4 text-gray-400" />
                  </Button>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="mb-2 text-base font-medium">Starting price</p>
                    <div className="flex">
                      <Input
                        placeholder="Amount"
                        className="rounded-r-none bg-[#2a2a2a] border-gray-700 focus-visible:ring-0 focus-visible:border-gray-500"
                        {...form.register("amount")}
                      />
                      <div className="flex items-center justify-center px-4 font-medium bg-[#2a2a2a] border border-l-0 border-gray-700 rounded-r-md">
                        ETH
                      </div>
                    </div>
                    {form.watch("amount") && <span className="text-sm text-gray-400">{handleEthToUsd(Number(form.watch("amount")))} USD</span>}
                    {form.formState.errors.amount && (
                      <p className="text-red-500 text-sm mt-1">
                        {form.formState.errors.amount.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <p className="mb-2 text-base font-medium">Duration</p>
                    <div className="flex">
                      <div className="mr-2 flex-1">
                        <Select
                          value={form.watch("duration")}
                          onValueChange={(value) =>
                            form.setValue("duration", value)
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
                        readOnly
                        className="px-3 bg-[#2a2a2a] border-gray-700 outline-none"
                      />
                      <input
                        type="time"
                        value={endTime}
                        readOnly
                        className="px-3 bg-[#2a2a2a] border-gray-700 outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Complete Button */}
            <div className="p-4 pt-2">
              <Button
                type="submit"
                className="w-full py-6 text-base font-medium bg-blue-600 hover:bg-blue-700"
              >
                Complete listing
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}