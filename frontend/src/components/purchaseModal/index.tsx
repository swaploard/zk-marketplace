import Image from 'next/image';
import { X } from 'lucide-react';
import { useAccount } from 'wagmi';
import { usePurchaseModal } from './hooks';
import { PinataFile } from '@/types';
import { EthPriceConvertor } from '@/components/ethPriceConvertor';
import { useEffect, useRef } from 'react';
import { parseUnits } from 'viem';
import Stepper from '@/components/steppers/createNftStepper';

interface IPurchaseModal {
  file?: PinataFile;
  contractName?: string;
  setClose?: (value: boolean) => void;
}
export default function ApprovePurchaseModal({
  file,
  contractName,
  setClose,
}: IPurchaseModal = {}) {
  const { chain } = useAccount();
  const { steps, showStepper, handlePurchase } = usePurchaseModal({
    file,
    setClose,
  });
  const { handleEthToUsd } = EthPriceConvertor();
  const priceInWei = Number(parseUnits(file.price.toString(), 18));
  const executedRef = useRef(false);

  useEffect(() => {
    if (!executedRef.current) {
      handlePurchase(BigInt(priceInWei));
      executedRef.current = true;
    }
  }, [handlePurchase, priceInWei]);

  const handleModalClose = () => {
    setClose(false);
  };
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="w-full max-w-md rounded-lg bg-[#121212] p-6 text-white shadow-xl">
        {showStepper && <Stepper steps={steps} />}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Approve purchase</h2>
          <button
            className="text-gray-400 hover:text-white"
            onClick={handleModalClose}
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex items-start mb-8">
          <div className="mr-4 flex-shrink-0">
            <Image
              src={`https://ipfs.io/ipfs/${file.AssetIpfsHash}`}
              alt={file.KeyValues.name}
              width={64}
              height={64}
              className="rounded-lg"
            />
          </div>

          <div className="flex-grow">
            <h3 className="text-lg font-semibold">{file.KeyValues.name}</h3>
            <p className="text-gray-400">{contractName}</p>
            <p className="text-gray-400">Chain: {chain.name}</p>
          </div>

          <div className="text-right">
            <p className="text-lg font-semibold">{file.price} ETH</p>
            <p className="text-gray-400">${handleEthToUsd(file.price)}</p>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-6">
          <h4 className="text-lg font-semibold">Go to your wallet</h4>
          <p className="text-gray-400">
            You&apos;ll be asked to approve this purchase from your wallet.
          </p>
        </div>
      </div>
    </div>
  );
}
