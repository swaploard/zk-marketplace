import { ArrowLeft, HelpCircle, ImageIcon, MoreHorizontal } from "lucide-react"
import Link from "next/link"

export default function CreateNFTCollection() {
  return (
    <div className="min-h-screen bg-black text-white">
      <header className="flex items-center justify-between p-4 border-b border-gray-800">
        <Link href="#" className="flex items-center gap-2 text-white">
          <ArrowLeft className="w-5 h-5" />
          <span className="text-lg font-medium">Create an NFT</span>
        </Link>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="bg-gray-800 p-1 rounded">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="24" height="24" rx="12" fill="#1E1E1E" />
              </svg>
            </div>
            <span>0 ETH</span>
          </div>
          <div className="flex items-center gap-2">
            <span>0 WETH</span>
          </div>
          <div className="w-8 h-8 rounded-full bg-purple-600"></div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto py-12 px-4">
        <div className="space-y-8">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold">First, you&apos;ll need to create a collection for your NFT</h1>
            {/* <p className="text-gray-400">
              You&apos;ll need to deploy an ERC-1155 contract on the blockchain to create a collection for your NFT.{" "}
              <Link href="#" className="text-blue-500 hover:underline">
                What is a contract?
              </Link>
            </p> */}
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <label htmlFor="logo" className="font-medium">
                  Logo image
                </label>
                <HelpCircle className="w-4 h-4 text-gray-500" />
              </div>

              <div className="border border-gray-800 rounded-lg p-6">
                <div className="flex flex-col items-center justify-center gap-4">
                  <div className="w-24 h-24 border border-gray-700 rounded-lg flex items-center justify-center">
                    <ImageIcon className="w-6 h-6 text-gray-500" />
                  </div>
                  <div className="text-center">
                    <p className="font-medium">Drag and drop or click to upload</p>
                    <p className="text-sm text-gray-400 mt-1">You may change this after deploying your contract.</p>
                    <p className="text-sm text-gray-400 mt-2">
                      Recommended size: 350 x 350. File types: JPG, PNG, SVG, or GIF
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <label htmlFor="contract-name" className="font-medium">
                    Contract name
                  </label>
                  <HelpCircle className="w-4 h-4 text-gray-500" />
                </div>
                <input
                  type="text"
                  id="contract-name"
                  className="w-full bg-gray-900 border border-gray-800 rounded-lg p-3"
                  placeholder="Enter contract name"
                  defaultValue="Ganesha"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <label htmlFor="token-symbol" className="font-medium">
                    Token symbol
                  </label>
                  <HelpCircle className="w-4 h-4 text-gray-500" />
                </div>
                <input
                  type="text"
                  id="token-symbol"
                  className="w-full bg-gray-900 border border-gray-800 rounded-lg p-3"
                  placeholder="Enter token symbol"
                  defaultValue="G"
                />
              </div>
            </div>

            {/* <div className="space-y-2">
              <div className="flex items-center gap-2">
                <label className="font-medium">Blockchain</label>
                <HelpCircle className="w-4 h-4 text-gray-500" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="border-2 border-gray-700 bg-gray-900 rounded-lg p-4 relative">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-900 flex items-center justify-center">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2L5 12L12 16L19 12L12 2Z" fill="#627EEA" />
                        <path d="M12 16L5 12L12 22L19 12L12 16Z" fill="#627EEA" />
                      </svg>
                    </div>
                    <span className="font-medium">Ethereum</span>
                  </div>
                  <div className="mt-2">
                    <span className="text-xs text-gray-400 bg-gray-800 px-2 py-1 rounded">Most popular</span>
                  </div>
                  <div className="mt-4 text-sm text-gray-400">Estimated cost to deploy contract:</div>
                </div>

                <div className="border border-gray-800 bg-gray-900 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="12" cy="12" r="10" fill="#0052FF" />
                      </svg>
                    </div>
                    <span className="font-medium">Base</span>
                  </div>
                  <div className="mt-2">
                    <span className="text-xs text-gray-400 bg-gray-800 px-2 py-1 rounded">Cheaper</span>
                  </div>
                  <div className="mt-4 text-sm text-gray-400">Estimated cost to deploy contract: $0.00</div>
                </div>

                <div className="border border-gray-800 bg-gray-900 rounded-lg p-4 flex flex-col items-center justify-center">
                  <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center">
                    <MoreHorizontal className="w-5 h-5" />
                  </div>
                  <span className="mt-2 font-medium">See more options</span>
                </div>
              </div>
            </div> */}
          </div>
        </div>
      </main>
    </div>
  )
}

