import { NextResponse, type NextRequest } from "next/server";
import { pinata } from "../../../utils/config/pinata";

// Upload a new file
export async function POST(request: NextRequest) {
  try {
    const data = await request.formData();
    const file: File | null = data.get("file") as unknown as File;
    const metadataString: string = data.get("pinataMetadata") as string;
    const groupId: string = data.get("collection") as string;

    const metadata = JSON.parse(metadataString);

    const uploadData = await pinata.upload
      .file(file)
      .addMetadata({
        keyValues: metadata,
      })
      .group(groupId);
    return NextResponse.json(uploadData, { status: 200 });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  let files;
  try {
    const { searchParams } = new URL(request.url);
    const collectionId = searchParams.get("collection");
    const walletAddress = searchParams.get("walletAddress");

    if (walletAddress) {
      try {
        files = await pinata
          .listFiles()
          .keyValue("walletAddress", walletAddress);
        return NextResponse.json({ files }, { status: 200 });
      } catch (pinataError) {
        console.error("Pinata API Error:", pinataError);
        return NextResponse.json(
          {
            error: "Failed to fetch collection",
            details:
              pinataError.response?.data?.error?.message || pinataError.message,
          },
          { status: pinataError.response?.status || 500 },
        );
      }
    }
    try {
      files = await pinata.listFiles().group(collectionId);
      return NextResponse.json({ files }, { status: 200 });
    } catch (pinataError) {
      console.error("Pinata API Error:", pinataError);
      return NextResponse.json(
        {
          error: "Failed to fetch collection",
          details:
            pinataError.response?.data?.error?.message || pinataError.message,
        },
        { status: pinataError.response?.status || 500 },
      );
    }
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

// Delete a file by IPFS hash
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const hash = searchParams.get("hash");
    if (!hash)
      return NextResponse.json({ error: "Missing hash" }, { status: 400 });

    await pinata.unpin([hash]);
    return NextResponse.json(
      { message: "File deleted successfully" },
      { status: 200 },
    );
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
