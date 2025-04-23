import { NextResponse, type NextRequest } from 'next/server';
import { pinata } from '@/utils/config/pinata';
import connectMongo from '@/lib/mongodb';
import { UploadDataModel } from '@/mongoSchemas/nftFile';
import _ from 'lodash';
import { Collection } from '@/mongoSchemas/collection';
import { PinataUploadResponse } from '@/types';
export async function POST(request: NextRequest) {
  await connectMongo();
  try {
    const data = await request.formData();
    const requiredFields = ['file', 'pinataMetadata', 'collection'];
    for (const field of requiredFields) {
      if (!data.get(field)) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    const file = data.get('file') as File;
    const metadataString = data.get('pinataMetadata') as string;
    const groupId = data.get('collection') as string;
    const walletAddress = data.get('walletAddress') as string;
    const tokenAddress = data.get('tokenAddress') as string;
    const metadata = JSON.parse(metadataString);

    const requiredMetadata = ['name', 'supply', 'description', 'externalLink'];

    for (const field of requiredMetadata) {
      if (!metadata[field]) {
        return NextResponse.json(
          { error: `Missing required metadata field: ${field}` },
          { status: 400 }
        );
      }
    }

    const fileUploadResponse = await pinata.upload.file(file).group(groupId);
    const fileCid = fileUploadResponse.IpfsHash;
    const attributes = Object.entries(metadata.additionalAttributes).map(
      ([trait_type, value]) => ({
        trait_type,
        value,
      })
    );

    const metadataJSON = {
      name: metadata.name,
      description: metadata.description,
      image: `https://ipfs.io/ipfs/${fileCid}`,
      external_url: metadata.externalLink,
      attributes: attributes,
    };

    const metadataBlob = new Blob([JSON.stringify(metadataJSON)], {
      type: 'application/json',
    });
    const metadataFile = new File([metadataBlob], 'metadata.json', {
      type: 'application/json',
    });

    const metadataUploadResponse = (await pinata.upload
      .file(metadataFile)
      .group(groupId)) as PinataUploadResponse;

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
      walletAddress: walletAddress,
      KeyValues: {
        name: metadata.name,
        supply: Number(metadata.supply),
        description: metadata.description,
        externalLink: metadata.externalLink,
      },
      tokenId: '',
      tokenAddress: tokenAddress,
      transactionHash: '',
      price: 0,
      highestBidder: '',
    };

    const newFile = new UploadDataModel(uploadData);
    await newFile.save();
    const volumeCount = (await UploadDataModel.find({ GroupId: groupId }))
      .length;
    await Collection.findOneAndUpdate(
      { groupId: groupId },
      {
        $set: {
          volume: volumeCount,
        },
      }
    );
    return NextResponse.json(newFile, { status: 200 });
  } catch (e) {
    console.error('API Error:', e);
    return NextResponse.json(
      { error: 'Internal Server Error', details: e.message },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const tokenAddress = searchParams.get('contractAddress');
    const walletAddress = searchParams.get('walletAddress');

    let files;
    if (
      !_.isEmpty(walletAddress) &&
      walletAddress !== 'null' &&
      walletAddress !== 'undefined'
    ) {
      try {
        files = await UploadDataModel.find({ walletAddress: walletAddress })
          .lean()
          .exec();
      } catch (error) {
        console.error('Database Error:', error);
        return NextResponse.json(
          {
            error: 'Failed to fetch files by wallet address',
            details: error.message,
          },
          { status: 500 }
        );
      }
    } else if (
      !_.isEmpty(tokenAddress) &&
      tokenAddress !== 'null' &&
      tokenAddress !== 'undefined'
    ) {
      try {
        files = await UploadDataModel.find({
          tokenAddress: tokenAddress,
          $or: [{ price: { $gt: 0 } }, { isActiveAuction: true }],
        })
          .lean()
          .exec();
      } catch (error) {
        console.error('Pinata API Error:', error);
        return NextResponse.json(
          {
            error: 'Failed to fetch collection',
            details: error.response?.data?.error?.message || error.message,
          },
          { status: error.response?.status || 500 }
        );
      }
    } else {
      try {
        files = await UploadDataModel.find({}).lean().exec();
      } catch (error) {
        console.error('Database Error:', error);
        return NextResponse.json(
          { error: 'Failed to fetch all files', details: error.message },
          { status: 500 }
        );
      }
    }
    return NextResponse.json(files, { status: 200 });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const assetCID = searchParams.get('assetcid');
    const metadataCID = searchParams.get('metadatacid');

    if (!assetCID && !metadataCID)
      return NextResponse.json({ error: 'Missing hash' }, { status: 400 });

    const metadataFile = await pinata.unpin([metadataCID]);
    const assetFile = await pinata.unpin([assetCID]);
    if (
      metadataFile[0].status.includes('OK') &&
      assetFile[0].status.includes('OK')
    ) {
      const deleteFile = await UploadDataModel.findOneAndDelete({
        IpfsHash: assetCID,
      });
      const volumeCount = (
        await UploadDataModel.find({ GroupId: deleteFile.GroupId })
      ).length;
      await Collection.findOneAndUpdate(
        { groupId: deleteFile.GroupId },
        {
          $set: {
            volume: volumeCount,
          },
        }
      );
    }

    return NextResponse.json(
      { message: 'File deleted successfully' },
      { status: 200 }
    );
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  await connectMongo();

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!_.isEmpty(id) && id !== 'null' && id !== 'undefined') {
    try {
      const { tokenId } = await request.json();
      if (!tokenId) {
        console.error('Missing required fields: tokenId, tokenAddress');
        return NextResponse.json(
          {
            error:
              'Missing required fields: tokenId, tokenAddress, transactionHash',
          },
          { status: 400 }
        );
      }

      const updatedDocument = await updateTokenIdAndAddress(id, tokenId);

      return NextResponse.json(updatedDocument, { status: 200 });
    } catch (error) {
      console.error('Error updating token details:', error);
      return handleUpdateError(error);
    }
  }

  try {
    const { tokenId, ...data } = await request.json();
    if (_.isEmpty(tokenId)) {
      return NextResponse.json(
        { error: 'Missing required parameters tokenId' },
        { status: 400 }
      );
    }
    const updatedDocument = await UploadDataModel.findOneAndUpdate(
      { _id: tokenId },
      { $set: data },
      { new: true }
    ).exec();

    if (Object.keys(data).includes('price')) {
      const floorPice = await Collection.findOne({
        groupId: updatedDocument.GroupId,
      });

      if (floorPice.floor > data.price || floorPice.floor === 0) {
        await Collection.findOneAndUpdate(
          { groupId: updatedDocument.GroupId },
          {
            $set: {
              floor: data.price,
            },
          }
        );
      }
    }
    return NextResponse.json(updatedDocument, { status: 200 });
  } catch (error) {
    console.error('Error updating file data:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

const updateTokenIdAndAddress = async (id: string, tokenId: string) => {
  try {
    const updateToken = await UploadDataModel.findOneAndUpdate(
      { ID: id },
      {
        $set: { tokenId },
      },
      { new: true }
    ).exec();

    return NextResponse.json(updateToken, { status: 200 });
  } catch (error) {
    console.error('Error updating file data:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
};

const handleUpdateError = (error: Error) => {
  if (error.message === 'DOCUMENT_NOT_FOUND') {
    return NextResponse.json({ error: 'Document not found' }, { status: 404 });
  }

  return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
};
