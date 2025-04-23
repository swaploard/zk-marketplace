import { NextResponse, type NextRequest } from 'next/server';
import { pinata } from '../../../utils/config/pinata';
import connectMongo from '@/lib/mongodb';
import { Collection } from '@/mongoSchemas/collection';
import User from '@/mongoSchemas/User';
import { saveFile } from '@/utils/routeHelper/saveImage';
import { collection } from '@/types';
import _ from 'lodash';
export async function POST(request: NextRequest) {
  await connectMongo();

  try {
    const formData = await request.formData();

    const file = formData.get('file') as File;
    const contractName = formData.get('contractName') as string;
    const tokenSymbol = formData.get('tokenSymbol') as string;
    const walletAddress = formData.get('walletAddress') as string;
    const collectionLogo = await saveFile(formData.get('file') as File);

    if (!file || !contractName || !tokenSymbol || !walletAddress) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const existingUser = await User.findOne({ walletAddress });
    if (!existingUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const existingCollection = await Collection.findOne({
      contractName,
      tokenSymbol,
    });

    if (existingCollection) {
      return NextResponse.json(
        { error: 'Collection already exists' },
        { status: 400 }
      );
    }
    let group;
    try {
      group = await pinata.groups.create({
        name: `${contractName} (${tokenSymbol})`,
      });

      if (!group.id) {
        return NextResponse.json(
          { error: 'No group ID returned' },
          { status: 400 }
        );
      }
    } catch (error) {
      console.error('Error creating group:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }

    const newCollection = new Collection({
      User: existingUser._id,
      contractName,
      tokenSymbol,
      groupId: group.id,
      logoUrl: collectionLogo,
    });

    await newCollection.save();

    const collection = await Collection.find({ groupId: group.id });

    return NextResponse.json(collection, { status: 200 });
  } catch (error) {
    console.error('Error creating group:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  await connectMongo();
  const { searchParams } = new URL(request.url);
  const walletAddress = searchParams.get('walletAddress');
  const tokenAddress = searchParams.get('contractAddress');

  if (
    !_.isEmpty(tokenAddress) &&
    tokenAddress !== 'null' &&
    tokenAddress !== 'undefined'
  ) {
    try {
      const collection = await Collection.find({
        contractAddress: tokenAddress,
      })
        .lean()
        .exec();
      return NextResponse.json(collection, { status: 200 });
    } catch (error) {
      console.error('Error fetching collections:', error);
      return NextResponse.json(
        { error: 'Failed to fetch collections' },
        { status: 500 }
      );
    }
  }

  try {
    let collections;
    if (
      !_.isEmpty(walletAddress) &&
      walletAddress !== 'null' &&
      walletAddress !== 'undefined'
    ) {
      const user = await User.findOne({ walletAddress });
      collections = await Collection.find({ User: user._id })
        .sort({ createdAt: -1 })
        .lean();
    } else {
      collections = await Collection.find().sort({ createdAt: -1 });
    }
    return NextResponse.json(collections, { status: 200 });
  } catch (error) {
    console.error('Error fetching collections:', error);
    return NextResponse.json(
      { error: 'Failed to fetch collections' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  await connectMongo();

  const formData = await request.formData();

  const collectionId = formData.get('collectionId');
  const updateData: Partial<collection> = {};
  const files: Record<string, File> = {};

  try {
    for (const [key, value] of formData.entries()) {
      if (value instanceof File) {
        if (value.size > 0) {
          files[key] = value;
        }
      } else {
        updateData[key] = value;
      }
    }

    if (files.logoUrl) {
      updateData.logoUrl = await saveFile(files.logoUrl);
    }

    const updateCollection = await Collection.findOneAndUpdate(
      { _id: collectionId },
      {
        $set: {
          contractName: updateData.contractName,
          tokenSymbol: updateData.tokenSymbol,
          logoUrl: updateData.logoUrl,
          contractAddress: updateData.contractAddress,
        },
      },
      { new: true }
    );
    return NextResponse.json(updateCollection, { status: 200 });
  } catch (error) {
    console.error('Error updating collection:', error);
    return NextResponse.json(
      { error: 'Failed to update collection' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  await connectMongo();
  const { searchParams } = new URL(request.url);
  const collectionId = searchParams.get('id');
  const groupId = searchParams.get('groupId');
  try {
    await pinata.groups.delete({ groupId: groupId });
    await Collection.deleteOne({ _id: collectionId });
    return NextResponse.json(
      { message: 'Collection deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting collection:', error);
    return NextResponse.json(
      { error: 'Failed to delete collection' },
      { status: 500 }
    );
  }
}
