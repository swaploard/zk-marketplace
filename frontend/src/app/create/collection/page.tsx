'use client';
import { useState, useRef } from 'react';
import Image from 'next/image';
import {
  ArrowLeft,
  HelpCircle,
  ImageIcon,
  Edit,
  Info,
  Ellipsis,
} from 'lucide-react';
import Link from 'next/link';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Card } from '@/components/ui/card';
import AdvancedERC1155 from '@/utils/contracts/AdvancedERC1155.json';
import { sepolia, amoy } from '@/utils/constants/chainID';
import useCollectionStore from '../../../store/collectionSlice';
import {
  useSendTransaction,
  useAccount,
  useSwitchChain,
  usePublicClient,
} from 'wagmi';
import { encodeDeployData, Abi, ContractConstructorArgs } from 'viem';
import { localhost } from 'viem/chains';
import { ICollectionStore, Step, StepStatus } from '@/types';
import Stepper from '@/components/steppers/createNftStepper';
import { collectionSteps } from '../constants';
import RequireWallet from '@/components/connection';
import { usePathname, useSearchParams } from 'next/navigation';

const formSchema = z.object({
  contractName: z
    .string()
    .min(1, 'Contract name is required')
    .max(50, 'Contract name must be less than 50 characters')
    .regex(/^[a-zA-Z0-9 ]+$/, 'Only letters, numbers and spaces allowed'),

  tokenSymbol: z
    .string()
    .min(1, 'Token symbol is required')
    .max(5, 'Token symbol must be 5 characters or less')
    .regex(/^[A-Z]+$/, 'Must be uppercase letters only'),

  logoImage: z
    .instanceof(File, { message: 'File is required' })
    .refine((file) => file.size <= 50 * 1024 * 1024, 'File must be under 50MB')
    .refine(
      (file) =>
        [
          'image/jpeg',
          'image/png',
          'image/gif',
          'image/svg+xml',
          'video/mp4',
        ].includes(file.type),
      'Invalid file type. Allowed: JPG, PNG, GIF, SVG, MP4'
    ),
});

type FormValues = z.infer<typeof formSchema>;

export default function CreateNFTCollection() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const {
    deleteCollection,
    updateCollection,
    createCollection,
    getLatestCollection,
  } = useCollectionStore((state: ICollectionStore) => state);
  const publicClient = usePublicClient();
  const { address, chain } = useAccount();
  const { sendTransaction } = useSendTransaction();
  // const {
  //   isLoading: isConfirming,
  //   isSuccess: isConfirmed,
  //   data,
  // } = useWaitForTransactionReceipt({ hash });
  const { switchChain } = useSwitchChain();
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {},
  });

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isHovering, setIsHovering] = useState(false);
  const [steps, setSteps] = useState<Step[]>(collectionSteps);
  const [showStepper, setShowStepper] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    try {
      setValue('logoImage', file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error('File validation error:', error.errors[0].message);
      }
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
  };

  const updateStepStatus = (stepIndex: number, newStatus: StepStatus) => {
    setSteps((prev) =>
      prev.map((step, index) =>
        index === stepIndex ? { ...step, status: newStatus } : step
      )
    );
  };

  const onSubmit = async (data: FormValues) => {
    setShowStepper(true);
    updateStepStatus(0, 'current');
    const formData = new FormData();
    formData.append('contractName', data.contractName);
    formData.append('tokenSymbol', data.tokenSymbol);
    formData.append('file', data.logoImage);
    formData.append('walletAddress', address);
    await createCollection(formData);
    const collection = getLatestCollection();
    const marketplaceAddress = process.env
      .NEXT_PUBLIC_MARKETPLACE_ADDRESS as `0x${string}`;
    if (
      collection[0].contractName === data.contractName &&
      collection[0].tokenSymbol === data.tokenSymbol
    ) {
      const deployData = await encodeDeployData({
        abi: AdvancedERC1155.abi as Abi,
        bytecode: AdvancedERC1155.bytecode.object as `0x${string}`,
        args: [
          data.contractName,
          data.tokenSymbol,
          'https://ipfs.io/ipfs/',
          collection[0].groupId,
          address,
          500,
          marketplaceAddress,
        ] as unknown as ContractConstructorArgs<typeof AdvancedERC1155.abi>,
      });
      updateStepStatus(0, 'completed');
      updateStepStatus(1, 'current');
      await sendTransaction(
        {
          to: null,
          data: deployData,
        },
        {
          onSuccess: async (transactionHash) => {
            updateStepStatus(1, 'completed');
            updateStepStatus(2, 'current');
            const receipt = await publicClient.waitForTransactionReceipt({
              hash: transactionHash,
            });
            if (receipt.contractAddress) {
              const formData = new FormData();
              formData.append('collectionId', collection[0]._id);
              formData.append('contractAddress', receipt.contractAddress);
              updateCollection(formData);
              setShowStepper(false);
              reset();
              setPreviewUrl('');
              updateStepStatus(2, 'completed');
              setSteps(collectionSteps);
            }
          },
          onError: (error) => {
            console.error('Transaction failed:', error);
            deleteCollection(collection[0]._id, collection[0].groupId);
            setShowStepper(false);
            setSteps(collectionSteps);
          },
        }
      );
    }
  };
  const handleNetworkChange = async (targetChainId: number) => {
    switchChain?.({ chainId: targetChainId });
  };

  const getCurrentPageUrl = () => {
    const params = new URLSearchParams(searchParams);
    const fullUrl = `${pathname}${params.toString() ? `?${params.toString()}` : ''}`;
    return fullUrl;
  };

  return (
    <RequireWallet callbackUrl={getCurrentPageUrl()}>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="min-h-screen bg-black text-white"
      >
        <header className="fixed top-0 left-0 right-0 bg-black z-10 border-b border-gray-800 p-4">
          <div className="flex items-center justify-between p-4 ">
            <Link href="/create" className="flex items-center gap-2 text-white">
              <ArrowLeft className="w-5 h-5" />
              <span className="text-lg font-medium">Create an NFT</span>
            </Link>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="bg-gray-800 p-1 rounded">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
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
          </div>
        </header>
        {showStepper && <Stepper steps={steps} />}
        <main className="flex-1 overflow-auto pt-16 pb-24">
          <div className="max-w-3xl mx-auto py-12 px-4">
            <div className="space-y-8">
              <div className="space-y-2">
                <h1 className="text-4xl font-bold">
                  First, you&apos;ll need to create a collection for your NFT
                </h1>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <label htmlFor="logo" className="font-medium">
                      Logo image
                    </label>
                    <HelpCircle className="w-4 h-4 text-gray-500" />
                  </div>
                  <div
                    className="border border-gray-800 rounded-lg p-6 relative group"
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onMouseEnter={() => setIsHovering(true)}
                    onMouseLeave={() => setIsHovering(false)}
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept="image/*"
                      onChange={handleFileInput}
                      cy-input="collection-logo"
                    />

                    <div
                      className="flex flex-col items-center justify-center gap-4 cursor-pointer"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      {previewUrl ? (
                        <div className="relative">
                          <Image
                            src={previewUrl}
                            alt="Preview"
                            className="w-24 h-24 rounded-lg object-cover"
                            width={240}
                            height={240}
                          />
                          {isHovering && (
                            <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                              <Edit className="w-6 h-6 text-white" />
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="w-24 h-24 border border-gray-700 rounded-lg flex items-center justify-center">
                          <ImageIcon className="w-6 h-6 text-gray-500" />
                        </div>
                      )}
                      <div className="text-center">
                        <p className="font-medium">
                          {previewUrl
                            ? 'Click or drag to replace image'
                            : 'Drag and drop or click to upload'}
                        </p>
                        <p className="text-sm text-gray-400 mt-1">
                          You may change this after deploying your contract.
                        </p>
                        <p className="text-sm text-gray-400 mt-2">
                          Recommended size: 350 x 350. File types: JPG, PNG,
                          SVG, or GIF
                        </p>
                      </div>
                    </div>
                  </div>
                  {errors.logoImage && (
                    <p className="text-red-500 text-sm">
                      {errors.logoImage.message}
                    </p>
                  )}
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
                      {...register('contractName')}
                      type="text"
                      id="contract-name"
                      className="w-full bg-gray-900 border border-gray-800 rounded-lg p-3"
                      placeholder="Enter contract name"
                      cy-input="collection-name"
                    />
                    {errors.contractName && (
                      <p className="text-red-500 text-sm">
                        {errors.contractName.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <label htmlFor="token-symbol" className="font-medium">
                        Token symbol
                      </label>
                      <HelpCircle className="w-4 h-4 text-gray-500" />
                    </div>
                    <input
                      {...register('tokenSymbol')}
                      type="text"
                      id="token-symbol"
                      className="w-full bg-gray-900 border border-gray-800 rounded-lg p-3"
                      placeholder="Enter token symbol"
                      cy-input="collection-symbol"
                    />
                    {errors.tokenSymbol && (
                      <p className="text-red-500 text-sm">
                        {errors.tokenSymbol.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Blockchain Selection Section */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span>Blockchain</span>
                    <Info className="w-4 h-4 text-gray-400" />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <Card
                      className={`bg-zinc-900 border-gray-700 p-4 cursor-pointer ${chain.id === sepolia ? 'ring-2 ring-blue-500' : ''}`}
                      onClick={() => handleNetworkChange(sepolia)}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Image
                          src="https://upload.wikimedia.org/wikipedia/commons/0/05/Ethereum_logo_2014.svg"
                          alt="Ethereum"
                          width={24}
                          height={24}
                          className="rounded-full"
                        />
                        <span>Ethereum</span>
                      </div>
                      <div className="text-xs text-gray-400">Most popular</div>
                      <div className="mt-4 text-xs text-gray-400">
                        Estimated cost to deploy contract:
                      </div>
                    </Card>
                    <Card
                      className={`bg-zinc-900 border-gray-700 p-4 cursor-pointer ${chain.id === amoy ? 'ring-2 ring-blue-500' : ''}`}
                      onClick={() => handleNetworkChange(amoy)}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Image
                          src="https://altcoinsbox.com/wp-content/uploads/2023/03/matic-logo-300x300.webp"
                          alt="Base"
                          width={24}
                          height={24}
                          className="rounded-full"
                        />
                        <span>Matic</span>
                      </div>
                      <div className="text-xs text-gray-400">Cheaper</div>
                      <div className="mt-4 text-xs text-gray-400">
                        Estimated cost to deploy contract: $0.00
                      </div>
                    </Card>
                    <Card
                      className="bg-zinc-900 border-gray-700 p-4 relative"
                      onClick={() => switchChain({ chainId: localhost.id })}
                    >
                      <div className="flex items-center gap-2 mb-2 bg-gray-800 p-2 w-10 rounded-full">
                        <Ellipsis />
                      </div>
                      <div className="text-xs text-blue-400">Change</div>
                      <div className="mt-4 text-xs text-gray-400">
                        Estimated cost to deploy contract:
                      </div>
                    </Card>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
        <footer className="fixed bottom-0 left-0 right-0 bg-black border-t border-gray-800 p-4">
          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-purple-600 hover:bg-purple-700 px-6 py-2 rounded transition-colors"
              cy-button="create-collection"
            >
              Continue
            </button>
          </div>
        </footer>
      </form>
    </RequireWallet>
  );
}
