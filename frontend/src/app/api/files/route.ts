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
  try {
    const { searchParams } = new URL(request.url);
    const hash = searchParams.get("hash");
    const list = searchParams.get("list");

    if (hash) {
      const url = await pinata.gateways.convert(hash);
      return NextResponse.json({ url }, { status: 200 });
    } else if (list) {
      const files = await pinata.listFiles();

      return NextResponse.json({ files: files }, { status: 200 });
    }

    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
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
