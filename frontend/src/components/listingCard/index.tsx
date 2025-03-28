import Image from "next/image";
import { Button } from "@/components/ui/button";
import {PinataFile} from "@/types"
interface IPriceCardNft {
  file: PinataFile;
  handleQuickList: (file: PinataFile) => void;
}

export default function ListingCard({ file, handleQuickList }: IPriceCardNft) {
  return (
    <div className="flex items-center justify-center p-2">
      <div className="max-w-md w-full bg-white rounded overflow-hidden shadow-xl group relative">
        <div className="relative aspect-square w-full flex-shrink-0">
          {file.AssetIpfsHash && (
            <Image
              src={`https://silver-rainy-chipmunk-430.mypinata.cloud/ipfs/${file.AssetIpfsHash}`}
              alt="Human Unreadable #262 - Digital Artwork"
              className="object-cover"
              fill
            />
          )}
        </div>

        <div className="p-2 flex-grow relative min-h-[60px]">
          <h1 className="text-base text-black font-bold mb-1 line-clamp-2 min-h-[40px]">
          {file.KeyValues.name && file?.KeyValues?.name}
          </h1>
         <p className="text-sm text-black font-normal min-h-[20px]">{file?.KeyValues?.amount && `${file?.KeyValues?.amount} ETH`}</p>
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
