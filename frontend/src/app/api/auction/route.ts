import { NextRequest, NextResponse } from "next/server";

import connectMongo from "@/lib/mongodb";
import { auction } from "@/mongoSchemas/Auction";

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
