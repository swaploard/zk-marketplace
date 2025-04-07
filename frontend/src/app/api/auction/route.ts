import { NextRequest, NextResponse } from "next/server";

import connectMongo from "@/lib/mongodb";
import { auction } from "@/mongoSchemas/Auction";
import mongoose from "mongoose";

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