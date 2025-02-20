"use client";

import { useAccount } from "wagmi";
import { useEffect, useState } from "react";
import { useConnectModal } from "@rainbow-me/rainbowkit";

import Image from "next/image";

import { Badge } from "../components/ui/badge";

export default function Home() {
  const { isConnected } = useAccount();
  const { openConnectModal } = useConnectModal();
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !isConnected) {
      openConnectModal?.();
    }
  }, [mounted, isConnected]);

  const handleAccount = () => {
    openConnectModal?.();
  };

  return (
    <div className="min-h-screen bg-black  text-white">
      {/* Navigation */}


      {/* Main Content */}

      <main className="px-6 py-8">
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Notable collections 
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {[
              {
                name: "Azuki Elementals",
                image:
                  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/marketplace-I6GvGPJh89nbHI1vnAGc08NQN75S3W.png",
                floor: "0.28 ETH",
                volume: "67K ETH",
                verified: true,
              },
              {
                name: "Skyborne - Genesis I",
                image:
                  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/marketplace-I6GvGPJh89nbHI1vnAGc08NQN75S3W.png",
                floor: "0.04 ETH",
                volume: "1,243 ETH",
                verified: true,
              },
              {
                name: "Cool Cats",
                image:
                  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/marketplace-I6GvGPJh89nbHI1vnAGc08NQN75S3W.png",
                floor: "0.50 ETH",
                volume: "155K ETH",
                verified: true,
              },
              {
                name: "Nifty Island: Legendary",
                image:
                  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/marketplace-I6GvGPJh89nbHI1vnAGc08NQN75S3W.png",
                floor: "0.17 ETH",
                volume: "2,321 ETH",
                verified: true,
              },
              {
                name: "Parallel Alpha",
                image:
                  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/marketplace-I6GvGPJh89nbHI1vnAGc08NQN75S3W.png",
                floor: "< 0.01 ETH",
                volume: "81K ETH",
                verified: true,
              },
            ].map((collection, i) => (
              <div
                key={i}
                className="bg-gray-900 rounded-xl overflow-hidden hover:ring-2 hover:ring-gray-700 transition-all"
              >
                <div className="aspect-square relative">
                  <Image
                    src={collection.image || "/placeholder.svg"}
                    alt={collection.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <h3 className="font-semibold">{collection.name}</h3>
                    {collection.verified && (
                      <Badge
                        variant="secondary"
                        className="bg-blue-500/10 text-blue-500"
                      >
                        ✓
                      </Badge>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-400">Floor</p>
                      <p className="font-medium">{collection.floor}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Total volume</p>
                      <p className="font-medium">{collection.volume}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-6">Top Collector Buys Today</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="bg-gray-900 rounded-xl overflow-hidden hover:ring-2 hover:ring-gray-700 transition-all"
              >
                <div className="aspect-square relative">
                  <Image
                    src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/marketplace-I6GvGPJh89nbHI1vnAGc08NQN75S3W.png"
                    alt="Collection"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
