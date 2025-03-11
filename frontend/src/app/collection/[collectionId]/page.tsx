"use client";
import { use, useEffect, useRef, useState } from "react";
import Image from "next/image";

import useHandleFiles, { IFileStore } from "@/store/fileSlice";
import FilterComponent from "@/components/topFilter";
import PriceCardNft from "@/components/nftPriceCard";

interface ICollectionPageParams {
  collectionId: string;
}
export default function CollectionPage({ params }) {
  const { files, getFiles } = useHandleFiles((state: IFileStore) => state);
  const [showEditButton, setShowEditButton] = useState(false);
  const [bannerImage, setBannerImage] = useState<string | null>();
  const [profileImage, setProfileImage] = useState<string | null>();
  const [showProfileEdit, setShowProfileEdit] = useState(false);

  const unwrappedParams: ICollectionPageParams = use(params);

  const bannerFileInputRef = useRef<HTMLInputElement>(null);
  const profileFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getFiles(unwrappedParams?.collectionId);
  }, [unwrappedParams.collectionId, getFiles]);

  const handleBannerClick = () => {
    bannerFileInputRef.current?.click();
  };
  const handleProfileClick = () => profileFileInputRef.current?.click();

  const handleImageUpload = async (file: File, type: "profile" | "banner") => {
    if (!file || !user?.walletAddress) return;
    const formData = new FormData();
    formData.append("walletAddress", user.walletAddress);
    formData.append(
      type === "profile" ? "profileImage" : "profileBanner",
      file,
    );
  };

  const handleFileSelect =
    (type: "profile" | "banner") =>
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      // Set preview image
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          if (type === "profile") {
            setProfileImage(e.target.result as string);
          } else {
            setBannerImage(e.target.result as string);
          }
        }
      };
      reader.readAsDataURL(file);
      await handleImageUpload(file, type);
    };

  return (
    <div className="flex flex-col min-h-screen bg-black text-white">
      {/* Banner */}
      <div
        className="relative h-64 w-full overflow-hidden"
        onMouseEnter={() => setShowEditButton(true)}
        onMouseLeave={() => setShowEditButton(false)}
      >
        <div
          className="absolute inset-0 bg-slate-900"
          style={
            bannerImage
              ? {
                  backgroundImage: `url(${bannerImage})`,
                  backgroundSize: "cover",
                }
              : {}
          }
        >
          <div className="absolute inset-0 opacity-20">
            <div className="flex flex-wrap -rotate-12"></div>
          </div>
        </div>

        {showEditButton && (
          <div
            className="absolute inset-0 bg-black/50 flex items-center justify-center cursor-pointer"
            onClick={handleBannerClick}
          >
            <svg
              className="h-8 w-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" // Corrected the d attribute
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </div>
        )}

        <input
          type="file"
          ref={bannerFileInputRef}
          accept="image/*"
          className="hidden"
          onChange={handleFileSelect("banner")}
        />
      </div>

      {/* Profile section */}
      <div className="px-6 pb-4 relative">
        <div className="flex justify-between items-start">
          <div className="flex items-start gap-4 -mt-14">
            {/* Profile picture */}
            <div className="px-6 pb-4 relative">
              <div className="flex justify-between items-start">
                <div className="flex items-start gap-4">
                  {/* Profile picture */}
                  <div
                    className="relative rounded-full border-4 border-black overflow-hidden h-24 w-24 bg-white cursor-pointer"
                    onMouseEnter={() => setShowProfileEdit(true)}
                    onMouseLeave={() => setShowProfileEdit(false)}
                    onClick={handleProfileClick}
                  >
                    {profileImage ? (
                      <Image
                        src={profileImage}
                        alt="Profile"
                        className="h-full w-full object-cover"
                        width={200}
                        height={200}
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center">
                        <svg viewBox="0 0 100 100" className="h-16 w-16">
                          {/* Existing SVG paths */}
                        </svg>
                      </div>
                    )}

                    {/* Profile edit overlay */}
                    {showProfileEdit && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <svg
                          className="h-6 w-6 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                      </div>
                    )}
                  </div>

                  <input
                    type="file"
                    ref={profileFileInputRef}
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileSelect("profile")}
                  />

                  {/* Rest of profile info remains same */}
                </div>
                {/* Buttons remain same */}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="w-screen sticky top-0 z-50">
        <FilterComponent />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {files &&
          files?.map((file) => (
            <PriceCardNft key={file.id} image={file.ipfs_pin_hash} />
          ))}
      </div>
    </div>
  );
}
