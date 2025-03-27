import { NextResponse, type NextRequest } from "next/server";
import { pinata } from "@/utils/config/pinata";
import connectMongo from "@/lib/mongodb";
import { UploadDataModel } from "@/models/nftFile";

export async function POST(request: NextRequest) {
  await connectMongo();

  try {
    const data = await request.formData();

    const requiredFields = ["file", "pinataMetadata", "collection"];
    for (const field of requiredFields) {
      if (!data.get(field)) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 },
        );
      }
    }

    const file = data.get("file") as File;
    const metadataString = data.get("pinataMetadata") as string;
    const groupId = data.get("collection") as string;

    const metadata = JSON.parse(metadataString);
    const requiredMetadata = [
      "name",
      "supply",
      "description",
      "externalLink",
      "walletAddress",
    ];
    for (const field of requiredMetadata) {
      if (!metadata[field]) {
        return NextResponse.json(
          { error: `Missing required metadata field: ${field}` },
          { status: 400 },
        );
      }
    }

    const fileUploadResponse = await pinata.upload
      .file(file)
      .group(groupId);
    const fileCid = fileUploadResponse.IpfsHash;

    const metadataJSON = {
      name: metadata.name,
      description: metadata.description,
      image: `https://ipfs.io/ipfs/${fileCid}`,
      external_url: metadata.externalLink,
      attributes: [
        {
          trait_type: "Supply",
          value: metadata.supply,
        },
        {
          trait_type: "Wallet Address",
          value: metadata.walletAddress,
        },
      ],
    };

    const metadataBlob = new Blob([JSON.stringify(metadataJSON)], {
      type: "application/json",
    });
    const metadataFile = new File([metadataBlob], "metadata.json", {
      type: "application/json",
    });

    const metadataUploadResponse = await pinata.upload
      .file(metadataFile)
      .group(groupId);
    const metadataCid = metadataUploadResponse.IpfsHash;

    const uploadData = {
      IpfsHash: metadataCid,
      AssetIpfsHash: fileCid,
      PinSize: metadataUploadResponse.PinSize,
      Timestamp: new Date(metadataUploadResponse.Timestamp),
      ID: metadataUploadResponse.ID,
      Name: metadataFile.name,
      NumberOfFiles: 1,
      MimeType: metadataFile.type,
      GroupId: groupId,
      KeyValues: {
        name: metadata.name,
        supply: Number(metadata.supply),
        description: metadata.description,
        externalLink: metadata.externalLink,
        walletAddress: metadata.walletAddress,
      },
      tokenId: "",
      tokenAddress: "",
      transactionHash: "",
    };

    const newFile = new UploadDataModel(uploadData);
    await newFile.save();

    return NextResponse.json(newFile, { status: 200 });
  } catch (e) {
    console.error("API Error:", e);
    return NextResponse.json(
      { error: "Internal Server Error", details: e.message },
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

    if (collectionId) {
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
    }
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const cid = searchParams.get("cid");
    if (!cid)
      return NextResponse.json({ error: "Missing hash" }, { status: 400 });

     const deleteResponse = await pinata.unpin([cid]);
     if(deleteResponse[0].status.includes("OK")){
        const deleteFile = await UploadDataModel.findOneAndDelete({ IpfsHash: cid }, { new: true });
     }
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

export async function PUT(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

    if (id) {
      try {
        const { tokenId, tokenAddress, transactionHash } = await request.json();
        
        if (!tokenId || !tokenAddress || !transactionHash) {
          return NextResponse.json(
            { error: "Missing required fields: tokenId, tokenAddress, transactionHash" },
            { status: 400 }
          );
        }
  
        const updatedDocument = await updateTokenIdAndAddress(
          id,
          tokenId,
          tokenAddress,
          transactionHash
        );
        
        return NextResponse.json(updatedDocument, { status: 200 });
      } catch (error) {
        console.error("Error updating token details:", error);
        return handleUpdateError(error);
      }
    }

  try {
    const { cid, name, keyValues } = await request.json();
    if (!cid || !name) {
      return NextResponse.json(
        { error: "Missing required parameters (CID or name)" },
        { status: 400 },
      );
    }

    const updateData = await pinata.updateMetadata({
      cid,
      keyValues: keyValues || {},
      name,
    });

    return NextResponse.json(updateData, { status: 200 });
  } catch (error) {
    console.error("Error updating metadata:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
 const updateTokenIdAndAddress = async (
  id: string,
  tokenId: string,
  tokenAddress: string,
  transactionHash: string,
) => {
  try {
    const updateToken = await UploadDataModel.findOneAndUpdate(
      { ID: id },
      {
        $set: { tokenId, tokenAddress, transactionHash },
      },
      { new: true },
    ).exec();

    return NextResponse.json(updateToken, { status: 200 });
  } catch (error) {
    console.error("Error updating metadata:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
};

const handleUpdateError = (error: Error) => {
  if (error.message === "DOCUMENT_NOT_FOUND") {
    return NextResponse.json(
      { error: "Document not found" },
      { status: 404 }
    );
  }
  
  return NextResponse.json(
    { error: "Internal Server Error" },
    { status: 500 }
  );
};
