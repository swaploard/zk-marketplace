"use client";
import { useEffect } from "react";
import Navbar from "@/components/navbar";

import useCollectionStore, { ICollectionStore } from "@/store/collectionSlice";
import { CollectionList } from "@/components/collectionList";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  const { collections, getCollections } = useCollectionStore(
    (state: ICollectionStore) => state,
  );

  useEffect(() => {
    getCollections("");
  }, [getCollections]);

  const handleCollectionList = (id: string) => {
    router.push(`/collection/${encodeURIComponent(id)}`);
  };
  return (
    <div className="min-h-screen bg-black  text-white">
      {/* Navigation */}
      <Navbar />

      {/* Main Content */}
      <main className="px-6 py-8">
        <CollectionList
          collections={collections}
          handleCollectionList={handleCollectionList}
        />
      </main>
    </div>
  );
}
