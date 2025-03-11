import Image from "next/image"
import { ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"

interface IPriceCardNft{
  image: string
}

export default function PriceCardNft({image}:IPriceCardNft) {
  return (
    <div className=" flex items-center justify-center p-2 bg-black">
      <div className="max-w-md w-full bg-white rounded-lg overflow-hidden shadow-xl">
        <div className="relative aspect-square w-full">
         {image && <Image
            src={`https://silver-rainy-chipmunk-430.mypinata.cloud/ipfs/${image}`}
            alt="Human Unreadable #262 - Digital Artwork"
            className="object-cover"
            fill
          />}
        </div>

        <div className="p-2">
          <h1 className="text-base text-black font-bold mb-2">Human Unreadable #262</h1>
          <p className="text-base text-black font-semibold mb-4">3.9 ETH</p>

          <Button className="w-full flex items-center bg-black text-white justify-center gap-2 hover:bg-slate-900">
            <ShoppingCart className="h-5 w-5 text-white" />
            Buy now
          </Button>
        </div>
      </div>
    </div>
  )
}

