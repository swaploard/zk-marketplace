import Image from "next/image";
import { Button } from "@/components/ui/button";
import {PinataFile} from "@/types"
interface IPriceCardNft {
  file: PinataFile;
  handleQuickList: (file: PinataFile) => void;
}

export default function ListingCard({ file, handleQuickList }: IPriceCardNft) {
  return (
    <div className="flex items-center justify-center p-2 bg-red">
      <div className="max-w-md w-full bg-white rounded-lg overflow-hidden shadow-xl group relative">
        <div className="relative aspect-square w-full">
          {file.ipfs_pin_hash && (
            <Image
              src={`https://silver-rainy-chipmunk-430.mypinata.cloud/ipfs/${file.ipfs_pin_hash}`}
              alt="Human Unreadable #262 - Digital Artwork"
              className="object-cover"
              fill
            />
          )}
        </div>

        <div className="p-2 relative">
          <h1 className="text-base text-black font-bold mb-2">
            Human Unreadable #262
          </h1>
          <p className="text-base text-black font-semibold">3.9 ETH</p>

          {/* Animated Button Container */}
          <div
            className="absolute bottom-0 left-0 right-0 h-0 overflow-hidden 
              group-hover:h-auto border border-solid group-hover:border-white transition-all duration-300"
          >
            <div className="">
              <Button
                className="w-full flex items-center bg-black text-white 
                justify-center gap-2 hover:bg-slate-900 translate-y-4 
                opacity-0 group-hover:translate-y-0 group-hover:opacity-100 
                transition-all duration-300"
                onClick={()=> handleQuickList(file)}
              >
                List for sale
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
