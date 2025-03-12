"use client";
import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Upload,
  ArrowLeft,
  Trash2,
  ChevronDown,
  LayoutGrid,
} from "lucide-react";
import Link from "next/link";
import { useAccount } from "wagmi";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import CollectionListPopover from "@/components/CollectionListPopover";

import useHandleFiles, { IFileStore } from "../../store/fileSlice";
import useCollectionStore, {
  ICollectionStore,
} from "../../store/collectionSlice";

const nftSchema = z.object({
  media: z
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
  collection: z.string().min(1, "Collection is required"),
  name: z.string().min(1, "NFT name is required"),
  walletAddress: z.string().min(1, "walletAddress is required"),
  supply: z.preprocess(
    (val) => Number(val),
    z.number().int().positive("Supply must be at least 1"),
  ),
  description: z.string().optional(),
  externalLink: z.string().url("Invalid URL format").optional(),
});

type NFTFormData = z.infer<typeof nftSchema>;

export default function NFTForm() {
  const { addFile } = useHandleFiles((state: IFileStore) => state);
  const { collections, getCollections } = useCollectionStore(
    (state: ICollectionStore) => state,
  );
  const { address } = useAccount();

  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<NFTFormData>({
    resolver: zodResolver(nftSchema),
    defaultValues: {
      walletAddress: address,
    },
  });

  useEffect(() => {
    getCollections(address);
  }, [address, getCollections]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setValue("media", selectedFile);
      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);
    }
  };

  const handleDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      const droppedFile = event.dataTransfer.files?.[0];
      if (droppedFile) {
        setFile(droppedFile);
        setValue("media", droppedFile);
        // Generate a preview URL for the file
        const url = URL.createObjectURL(droppedFile);
        setPreviewUrl(url);
      }
    },
    [setValue],
  );

  const handleDragOver = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
    },
    [],
  );

  const handleRemoveImage = () => {
    setFile(null);
    setPreviewUrl(null);
    setValue("media", null as unknown as File);
  };

  const onSubmit = async (data: NFTFormData) => {
    const { media, collection, ...rest } = data;

    if (!media) {
      console.error("No media file provided");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("file", media);
      formData.append("collection", collection);
      const pinataMetadata = JSON.stringify(rest);
      formData.append("pinataMetadata", pinataMetadata);

      const pinataOptions = JSON.stringify({ cidVersion: 1 });
      formData.append("pinataOptions", pinataOptions);
      addFile(formData);
    } catch (err) {
      console.error("Error uploading file:", err);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/">
              <ArrowLeft className="h-6 w-6" />
            </Link>
            <div className="space-y-1">
              <h1 className="text-2xl font-semibold">Create an NFT</h1>
              <p className="text-sm text-gray-400">
                Once your item is minted you will not be able to change any of
                its information.
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="grid grid-cols-1 md:grid-cols-2 gap-8"
        >
          {/* Upload Area */}
          <div
            className="border-2 border-dashed border-zinc-800 rounded-lg aspect-square flex flex-col items-center justify-center p-8 text-center cursor-pointer"
            onClick={() => document.getElementById("file-input")?.click()}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
            {previewUrl ? (
              <>
                {file?.type.startsWith("image/") ? (
                  <div className="relative w-full h-full">
                    {/* Use regular img tag for blob URLs */}
                    <Image
                      src={previewUrl}
                      alt="Preview"
                      className="w-full h-full object-cover rounded-lg"
                      width={500}
                      height={500}
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveImage();
                      }}
                      className="absolute top-2 right-2 bg-transparent rounded-full p-1 bg-slate-100 hover:bg-gray-600 transition-colors"
                    >
                      <Trash2
                        size={20}
                        className="bg-transparent text-red-500"
                      />
                    </button>
                  </div>
                ) : file?.type.startsWith("video/") ? (
                  <div className="relative w-full h-full">
                    <video
                      src={previewUrl}
                      controls
                      className="w-full h-full object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent triggering the file input
                        handleRemoveImage();
                      }}
                      className="absolute top-2 right-2 bg-transparent rounded-full p-1 bg-slate-100 hover:bg-gray-600 transition-colors"
                    >
                      <Trash2
                        size={20}
                        className="bg-transparent text-red-500"
                      />
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center">
                    <Upload className="h-8 w-8 mb-4 text-gray-400" />
                    <p className="text-sm text-gray-400">
                      Unsupported file type
                    </p>
                  </div>
                )}
              </>
            ) : (
              <>
                <Upload className="h-8 w-8 mb-4 text-gray-400" />
                <h3 className="font-medium mb-2">Drag and drop media</h3>
                <input
                  id="file-input"
                  type="file"
                  {...register("media")}
                  className="hidden"
                  onChange={handleFileChange}
                />
                <p className="text-sm text-gray-400 mb-4">Browse files</p>
                <p className="text-xs text-gray-500">
                  Max size: 50MB
                  <br />
                  JPG, PNG, GIF, SVG, MP4
                </p>
              </>
            )}
            {errors.media && (
              <p className="text-red-500 text-xs">{errors.media.message}</p>
            )}
          </div>

          {/* Form Fields */}
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium">
                Collection <span className="text-red-500">*</span>
              </label>
              <CollectionListPopover
                PopoverTriggerElement={
                  <Button
                    cy-test="popover-trigger-collection-list"
                    type="button"
                    variant="outline"
                    className="w-full justify-between h-auto py-3 bg-zinc-900 border-zinc-800"
                  >
                    <div className="flex items-center gap-2">
                      <div className="h-10 w-10 bg-zinc-800 rounded-lg flex items-center justify-center">
                        <LayoutGrid className="h-5 w-5" />
                      </div>
                      <span>Create a new collection</span>
                    </div>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                }
                collections={collections}
                setValue={setValue}
              ></CollectionListPopover>

              <p className="text-xs text-gray-400">
                Not all collections are eligible.{" "}
                <Link href="#" className="text-blue-500">
                  Learn more
                </Link>
              </p>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium">
                Collection <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder="Enter collection name"
                {...register("collection")}
                className="bg-zinc-900 border-zinc-800"
              />
              {errors.collection && (
                <p className="text-red-500 text-xs">
                  {errors.collection.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium">
                Name <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder="Name your NFT"
                {...register("name")}
                className="bg-zinc-900 border-zinc-800"
              />
              {errors.name && (
                <p className="text-red-500 text-xs">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium">
                Supply <span className="text-red-500">*</span>
              </label>
              <Input
                type="number"
                defaultValue="1"
                {...register("supply")}
                className="bg-zinc-900 border-zinc-800"
              />
              {errors.supply && (
                <p className="text-red-500 text-xs">{errors.supply.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium">Description</label>
              <Textarea
                placeholder="Enter a description"
                {...register("description")}
                className="min-h-[120px] bg-zinc-900 border-zinc-800"
              />
              {errors.description && (
                <p className="text-red-500 text-xs">
                  {errors.description.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium">External link</label>
              <Input
                placeholder="https://"
                {...register("externalLink")}
                className="bg-zinc-900 border-zinc-800"
              />
              {errors.externalLink && (
                <p className="text-red-500 text-xs">
                  {errors.externalLink.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-500 disabled:cursor-not-allowed"
            >
              Create
            </Button>

            <style>
              {`
                .disabled {
                  opacity: 0.5;
                  cursor: not-allowed;
                }
              `}
            </style>
          </div>
        </form>
      </div>
    </div>
  );
}
