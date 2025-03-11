"use client";
import { useEffect } from "react";

import Image from "next/image";
import Navbar from "@/components/navbar";

import { Badge } from "@/components/ui/badge";
import useCollectionStore, { ICollectionStore } from "@/store/collectionSlice"


export default function Home() {
  const {collections, getCollections } = useCollectionStore((state: ICollectionStore) => state);

  useEffect(() => {
    getCollections("");
  }, [ getCollections]);
   console.log(collections);
  return (
    <div className="min-h-screen bg-black  text-white">
      {/* Navigation */}
      <Navbar />

      {/* Main Content */}
      <main className="px-6 py-8">
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Notable collections</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {collections?.map((collection, i) => (
              <div
                key={i}
                className="bg-gray-900 rounded-xl overflow-hidden hover:ring-2 hover:ring-gray-700 transition-all"
              >
                <div className="h-40 relative">
                  <Image
                    src={collection.logoUrl || "/placeholder.svg"}
                    alt={collection.contractName}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <h3 className="font-semibold text-xs truncate">
                      {collection.contractName}
                    </h3>
                      <Badge
                        variant="secondary"
                        className="bg-blue-500/10 text-blue-500 text-xs"
                      >
                        ✓
                      </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-400 ">Floor</p>
                      <p className="font-medium text-xs">0.01 ETH</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Total volume</p>
                      <p className="font-medium text-xs">100</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
