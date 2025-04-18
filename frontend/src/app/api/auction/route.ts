import { NextRequest, NextResponse } from "next/server";

import connectMongo from "@/lib/mongodb";
import { auction } from "@/mongoSchemas/Auction";
import mongoose from "mongoose";
import { graphQLClient } from '@/lib/graphqlClient';
import { auctionsQuery } from "./queries";
import Marketplace from '@/utils/contracts/Marketplace.json';
import { sepoliaProvider } from "@/utils/config/ethersProvider";
import { ethers } from "ethers";
import { auctionQueue } from "@/lib/queue";

export async function POST(request: NextRequest) {
  await connectMongo();
  try {
    const auctionData = await request.json();
    const newAuction = new auction(auctionData);
    await newAuction.save();
    return NextResponse.json(newAuction, { status: 200 });
  } catch (error) {
    console.error("Error creating auction:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  await connectMongo();
  finalizeAuction();
  const { searchParams } = new URL(request.url);
  try {
    const fileId = new mongoose.Types.ObjectId(searchParams.get("fileId"));
    const auctions = await auction.findOne({
      file: fileId,
    }).sort({ createdAt: -1 });
    return NextResponse.json(auctions, { status: 200 });
  } catch (error) {
    console.error("Error fetching auctions:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest) {
  await connectMongo();
  const { searchParams } = new URL(request.url);
  try{
    const auctionId = new mongoose.Types.ObjectId(searchParams.get("auctionId"));
    const auctionData = await request.json();
    const updatedAuction = await auction.findOneAndUpdate(
      { _id: auctionId },
      { $set: auctionData },
      { new: true }
    );
    return NextResponse.json(updatedAuction, { status: 200 });
  }catch(error){
    console.error("Error fetching auctions:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }

}

function isAuctionDone(targetTimestampBigInt) {
  const now = BigInt(Math.floor(Date.now() / 1000));
  return now >= targetTimestampBigInt;
}

export async function finalizeAuction() {
  try {
    // 1. Fetch active auctions
    const { auctionCreateds } = await graphQLClient.request<{ auctionCreateds: any[] }>(auctionsQuery);
    
    // 2. Validate response structure
    if (!Array.isArray(auctionCreateds)) {
      console.error('Invalid auctions response:', auctionCreateds);
      return;
    }

    const marketPlaceAddress = process.env.NEXT_PUBLIC_MARKETPLACE_ADDRESS;
    if (!marketPlaceAddress) {
      throw new Error('MARKETPLACE_ADDRESS env variable not set');
    }

    const contract = new ethers.Contract(
      marketPlaceAddress,
      Marketplace.abi,
      sepoliaProvider
    );

    // 3. Process auctions in parallel
    const results = await Promise.all(
      auctionCreateds.map(async (auction) => {
        try {
          const auctionId = Number(auction.auctionId);
          const auctionData = await contract.auctions(auctionId);
          
          // Convert to inspectable format
          const auctionDetails = {
            endTime: auctionData[8], // Verify this is the correct index
            // Add other fields as needed
          };
  
          // Handle both BigNumber and number cases
          const endTime = typeof auctionDetails.endTime === 'object' && 
                         'toNumber' in auctionDetails.endTime
            ? auctionDetails.endTime.toNumber()
            : Number(auctionDetails.endTime);
  
          const currentTime = Math.floor(Date.now() / 1000);
  
          if (currentTime >= endTime) {
            console.log(`Auction ${auctionId} ready for finalization`);
            return auctionId;
          }
        } catch (error) {
          console.error(`Error processing auction ${auction.auctionId}:`, error);
          return null;
        }
      })
    );

    // 5. Filter valid auction IDs
    const validAuctionIds = results.filter((id): id is number => id !== null);
    
    // 6. Create jobs with proper typing
    const jobs: {
      name: string;
      data: { auctionId: number };
      opts: { jobId: string };
    }[] = validAuctionIds.map(auctionId => ({
      name: "finalize-auction",
      data: { auctionId },
      opts: { jobId: `finalize-${auctionId}-${Date.now()}` } // Add timestamp for uniqueness
    }));

    console.log('Creating jobs:', jobs);
    
    // 7. Add jobs with error handling
    if (jobs.length > 0) {
      const result = await auctionQueue.addBulk(jobs);
      console.log('Jobs added successfully:', result.length);
    } else {
      console.log('No auctions need finalization');
    }
  } catch (error) {
    console.error('Error in finalizeAuction:', error);
    throw error; // Propagate for error monitoring
  }
}
