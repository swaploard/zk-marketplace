import Image from 'next/image';
import { Badge } from '@/components/ui/badge';

import { collection } from '@/types';
export const CollectionList: React.FC<{
  collections: collection[];
  handleCollectionList: (id: string) => void;
}> = ({ collections, handleCollectionList }) => {
  return (
    <section className="mb-12">
      <h2 className="text-2xl font-bold mb-6">Notable collections</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {collections?.map((collection) => (
          <div
            key={collection._id}
            onClick={() => handleCollectionList(collection.contractAddress)}
            className="bg-gray-900 rounded-xl overflow-hidden hover:ring-2 hover:ring-gray-700 transition-all"
          >
            <div className="relative aspect-square w-full flex-shrink-0">
              <Image
                src={collection.logoUrl || '/placeholder.svg'}
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
                  <p className="font-medium text-xs">
                    {collection.floor.toFixed(4)}
                  </p>
                </div>
                <div className="">
                  <p className="text-xs text-gray-400 flex items-center gap-1">
                    Total&nbsp;volume
                  </p>
                  <p className="font-medium text-xs px-2">
                    {collection.volume}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
