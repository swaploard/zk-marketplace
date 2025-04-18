import { NextRequest, NextResponse } from 'next/server';
import { encodeFunctionData } from 'viem';
import Marketplace from '@/utils/contracts/Marketplace.json';
import { sepoliaSigner } from '@/utils/config/ethersProvider.js';

export async function POST(req: NextRequest) {
  const { functionName, args } = await req.json();
  const data = encodeFunctionData({
    abi: Marketplace.abi,
    functionName,
    args
  });

  try {
    const tx = await sepoliaSigner.sendTransaction({
      to: process.env.NEXT_PUBLIC_MARKETPLACE_ADDRESS,
      data
    });

    return NextResponse.json({ txHash: tx.hash });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}