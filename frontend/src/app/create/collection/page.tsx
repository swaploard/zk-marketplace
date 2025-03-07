"use client";
import { useState, useRef } from "react";
import Image from "next/image";

import { ArrowLeft, HelpCircle, ImageIcon, Edit } from "lucide-react";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import useCollectionStore, {
  ICollectionStore,
} from "../../../store/collectionSlice";

const formSchema = z.object({
  contractName: z
    .string()
    .min(1, "Contract name is required")
    .max(50, "Contract name must be less than 50 characters")
    .regex(/^[a-zA-Z0-9 ]+$/, "Only letters, numbers and spaces allowed"),

  tokenSymbol: z
    .string()
    .min(1, "Token symbol is required")
    .max(5, "Token symbol must be 5 characters or less")
    .regex(/^[A-Z]+$/, "Must be uppercase letters only"),

  logoImage: z
    .instanceof(File, { message: "File is required" })
    .refine((file) => file.size <= 50 * 1024 * 1024, "File must be under 50MB")
    .refine(
      (file) =>
        [
          "image/jpeg",
          "image/png",
          "image/gif",
          "image/svg+xml",
          "video/mp4",
        ].includes(file.type),
      "Invalid file type. Allowed: JPG, PNG, GIF, SVG, MP4",
    ),
});

type FormValues = z.infer<typeof formSchema>;

export default function CreateNFTCollection() {
  const { createCollection } = useCollectionStore(
    (state: ICollectionStore) => state,
  );

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {},
  });

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isHovering, setIsHovering] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    try {
      setValue("logoImage", file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error("File validation error:", error.errors[0].message);
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

  const onSubmit = async (data: FormValues) => {
    const formData = new FormData();
    formData.append("contractName", data.contractName);
    formData.append("tokenSymbol", data.tokenSymbol);
    formData.append("file", data.logoImage);
    formData.append(
      "walletAddress",
      "0x704cA993Cb734408E7A2affa39e1EEaE78213340",
    );
    createCollection(formData);
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="min-h-screen bg-black text-white"
    >
      <header className="fixed top-0 left-0 right-0 bg-black z-10 border-b border-gray-800 p-4">
        <div className="flex items-center justify-between p-4 ">
          <Link href="#" className="flex items-center gap-2 text-white">
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
                          ? "Click or drag to replace image"
                          : "Drag and drop or click to upload"}
                      </p>
                      <p className="text-sm text-gray-400 mt-1">
                        You may change this after deploying your contract.
                      </p>
                      <p className="text-sm text-gray-400 mt-2">
                        Recommended size: 350 x 350. File types: JPG, PNG, SVG,
                        or GIF
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
                    {...register("contractName")}
                    type="text"
                    id="contract-name"
                    className="w-full bg-gray-900 border border-gray-800 rounded-lg p-3"
                    placeholder="Enter contract name"
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
                    {...register("tokenSymbol")}
                    type="text"
                    id="token-symbol"
                    className="w-full bg-gray-900 border border-gray-800 rounded-lg p-3"
                    placeholder="Enter token symbol"
                  />
                  {errors.tokenSymbol && (
                    <p className="text-red-500 text-sm">
                      {errors.tokenSymbol.message}
                    </p>
                  )}
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
          >
            Continue
          </button>
        </div>
      </footer>
    </form>
  );
}
