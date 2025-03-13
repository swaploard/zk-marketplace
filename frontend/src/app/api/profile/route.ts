import { NextRequest, NextResponse } from "next/server";

import connectMongo from "@/lib/mongodb";
import User from "@/models/User";
import { saveFile } from "@/utils/routeHelper/saveImage";
import { user } from "@/types";

export async function GET(req: NextRequest) {
  await connectMongo();
  const { searchParams } = new URL(req.url);
  try {
    const walletAddress = searchParams.get("walletAddress");
    if (!walletAddress) {
      return NextResponse.json(
        { error: "walletAddress is required" },
        { status: 400 },
      );
    }

    const user = await User.findOne({ walletAddress });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user }, { status: 200 });
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function PUT(req: NextRequest) {
  await connectMongo();

  try {
    const formData = await req.formData();
    const updateData: user = {};
    const files: Record<string, File> = {};

    for (const [key, value] of formData.entries()) {
      if (value instanceof File) {
        if (value.size > 0) {
          files[key] = value;
        }
      } else {
        updateData[key] = value;
      }
    }

    if (files.profileImage) {
      updateData.profileImage = await saveFile(files.profileImage);
    }

    if (files.profileBanner) {
      updateData.profileBanner = await saveFile(files.profileBanner);
    }

    const updatedUser = await User.findOneAndUpdate(
      { walletAddress: updateData.walletAddress },
      {
        $set: {
          username: updateData.username,
          bio: updateData.bio,
          email: updateData.email,
          profileImage: updateData.profileImage,
          profileBanner: updateData.profileBanner,
          walletAddress: updateData.walletAddress,
        },
      },
    );

    if (!updatedUser) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Server error",
      },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  await connectMongo();
  try {
    const { walletAddress } = await req.json();
    if (!walletAddress || typeof walletAddress !== "string") {
      return NextResponse.json(
        {
          success: false,
          message: "Wallet address is required and must be a string",
        },
        { status: 400 },
      );
    }

    const existingUser = await User.findOne({ walletAddress });
    if (existingUser) {
      return NextResponse.json(
        { success: true, user: existingUser },
        { status: 201 },
      );
    }

    const newUser = await User.create({
      walletAddress,
      username: "",
      email: "",
      bio: "",
      profileImage: "",
      profileBanner: "",
      socials: {
        twitter: "",
        instagram: "",
      },
      links: [],
    });

    return NextResponse.json({ success: true, user: newUser }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message || "Server error" },
      { status: 500 },
    );
  }
}
