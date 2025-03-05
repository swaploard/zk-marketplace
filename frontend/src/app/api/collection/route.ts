import { NextResponse, type NextRequest } from "next/server";
import { pinata } from "../../../utils/config/pinata";
import connectMongo from "@/lib/mongodb";
import { CollectionGroup } from "@/models/collection";
import User from "@/models/User";
import { saveFile } from "@/utils/routeHelper/saveImage";

export async function POST(request: NextRequest) {
  await connectMongo();

  try {
    const formData = await request.formData();

    const file = formData.get("file") as File;
    const contractName = formData.get("contractName") as string;
    const tokenSymbol = formData.get("tokenSymbol") as string;
    const walletAddress = formData.get("walletAddress") as string;
    const collectionLogo = await saveFile(formData.get("file") as File);

    if (!file || !contractName || !tokenSymbol || !walletAddress) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const existingUser = await User.findOne({ walletAddress });
    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const group = await pinata.groups.create({
      name: `${contractName} (${tokenSymbol})`,
    });

    const collectionGroup = new CollectionGroup({
      User: existingUser._id,
      walletAddress,
      contractName,
      tokenSymbol,
      groupId: group.id,
      logoUrl: collectionLogo,
    });

    await collectionGroup.save();

    return NextResponse.json(
      {
        success: true,
        groupId: group.id,
        mongoId: collectionGroup._id,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error creating group:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
