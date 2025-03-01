"use client";
import { useRef, useState } from "react";
import Image from "next/image";
import {
  HeartHandshake,
  Share,
  MoreVertical,
  Filter,
  ChevronDown,
  Search,
  LayoutGrid,
  List,
  LayoutPanelTop,
  Columns,
} from "lucide-react";

import userSlice, { UserStore } from "../../../store/userSlice";

export default function Profile() {
  const { user, loading, error } = userSlice((state: UserStore) => state);
  const [bannerImage, setBannerImage] = useState<string | null>(null);
  const [showEditButton, setShowEditButton] = useState(false);
  const bannerFileInputRef = useRef<HTMLInputElement>(null);

  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [showProfileEdit, setShowProfileEdit] = useState(false);
  const profileFileInputRef = useRef<HTMLInputElement>(null);

  const handleBannerClick = () => {
    bannerFileInputRef.current?.click();
  };
  const handleProfileClick = () => profileFileInputRef.current?.click();

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  function formatDateToMonthYear(isoString) {
    return new Intl.DateTimeFormat("en-US", {
      month: "long",
      year: "numeric",
      timeZone: "UTC"
    }).format(new Date(isoString));
  }
  const handleFileSelect =
    (setImage: React.Dispatch<React.SetStateAction<string | null>>) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) =>
          e.target?.result && setImage(e.target.result as string);
        reader.readAsDataURL(file);
      }
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

        <input
          type="file"
          ref={bannerFileInputRef}
          accept="image/*"
          className="hidden"
          onChange={handleFileSelect(setBannerImage)}
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
                      <img
                        src={profileImage}
                        alt="Profile"
                        className="h-full w-full object-cover"
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
                    onChange={handleFileSelect(setProfileImage)}
                  />

                  {/* Rest of profile info remains same */}
                </div>
                {/* Buttons remain same */}
              </div>
            </div>

            <div className="mt-16">
              <div className="flex items-center gap-1">
                {user?.username ? (
                  <h1 className="text-2xl font-bold">{user.username}</h1>
                ) : (
                  <h1 className="text-2xl font-bold">Unnamed</h1>
                )}
                <span className="text-blue-500">
                  <svg
                    className="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                  </svg>
                </span>
              </div>
              <div className="text-gray-400 text-sm flex items-center gap-2">
                <span>
                  {user.walletAddress
                    ? truncateAddress(user.walletAddress)
                    : "0xCF00...A283"}
                </span>
                <span className="text-gray-600">•</span>
                <span>{formatDateToMonthYear(user.createdAt)}</span>
              </div>
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <button className="p-2 rounded-full hover:bg-gray-800">
              <HeartHandshake className="h-5 w-5" />
            </button>
            <button className="p-2 rounded-full hover:bg-gray-800">
              <Share className="h-5 w-5" />
            </button>
            <button className="p-2 rounded-full hover:bg-gray-800">
              <MoreVertical className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Navigation tabs */}
      <div className="border-b border-gray-800">
        <div className="flex overflow-x-auto hide-scrollbar">
          <button className="px-4 py-3 border-b-2 border-white font-medium text-sm">
            Collected <span className="ml-1 text-gray-400">18</span>
          </button>
          <button className="px-4 py-3 text-gray-400 hover:text-gray-200 font-medium text-sm">
            Offers made
          </button>
          <button className="px-4 py-3 text-gray-400 hover:text-gray-200 font-medium text-sm">
            Deals
          </button>
          <button className="px-4 py-3 text-gray-400 hover:text-gray-200 font-medium text-sm">
            Created
          </button>
          <button className="px-4 py-3 text-gray-400 hover:text-gray-200 font-medium text-sm">
            Favorited
          </button>
          <button className="px-4 py-3 text-gray-400 hover:text-gray-200 font-medium text-sm">
            Activity
          </button>
          <button className="px-4 py-3 text-gray-400 hover:text-gray-200 font-medium text-sm flex items-center">
            More <ChevronDown className="ml-1 h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Filter bar */}
      <div className="p-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <button className="p-2 rounded-full hover:bg-gray-800">
            <Filter className="h-5 w-5" />
          </button>

          <div className="relative">
            <button className="px-3 py-2 bg-gray-900 rounded-md flex items-center gap-2 text-sm">
              Status <ChevronDown className="h-4 w-4" />
            </button>
          </div>

          <div className="relative">
            <button className="px-3 py-2 bg-gray-900 rounded-md flex items-center gap-2 text-sm">
              Chains <ChevronDown className="h-4 w-4" />
            </button>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search by name"
              className="pl-9 pr-4 py-2 bg-gray-900 rounded-md text-sm w-64 focus:outline-none"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <button className="px-3 py-2 bg-gray-900 rounded-md flex items-center gap-2 text-sm">
              Recently received <ChevronDown className="h-4 w-4" />
            </button>
          </div>

          <div className="flex bg-gray-900 rounded-md">
            <button className="p-2 hover:bg-gray-800 rounded-l-md">
              <List className="h-4 w-4" />
            </button>
            <button className="p-2 hover:bg-gray-800 bg-gray-800">
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button className="p-2 hover:bg-gray-800">
              <LayoutPanelTop className="h-4 w-4" />
            </button>
            <button className="p-2 hover:bg-gray-800 rounded-r-md">
              <Columns className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Collection count */}
      <div className="px-4 pb-2 text-sm">18 items</div>

      {/* Grid of items */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 p-4">
        {/* Item 1 */}
        <div className="rounded-lg overflow-hidden bg-gray-900 hover:shadow-lg transition-shadow">
          <div className="aspect-square relative">
            <Image
              src="/placeholder.svg?height=300&width=300"
              alt="Sci-Fi Churches"
              width={300}
              height={300}
              className="object-cover"
            />
          </div>
          <div className="p-3">
            <div className="text-xs text-gray-400">120</div>
            <div className="font-medium truncate">Sci-Fi Churches</div>
          </div>
        </div>

        {/* Item 2 */}
        <div className="rounded-lg overflow-hidden bg-gray-900 hover:shadow-lg transition-shadow">
          <div className="aspect-square relative bg-red-500">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-20 h-20 bg-black">
                <div className="w-full h-2/3 flex">
                  <div className="w-1/3 h-full bg-black"></div>
                  <div className="w-1/3 h-full bg-black"></div>
                  <div className="w-1/3 h-full bg-black"></div>
                </div>
                <div className="w-full h-1/3 bg-green-700"></div>
              </div>
            </div>
          </div>
          <div className="p-3">
            <div className="text-xs text-gray-400">Somafm</div>
            <div className="font-medium truncate">Oppanism</div>
          </div>
        </div>

        {/* Items 3-6 (PLANET QU items) */}
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="rounded-lg overflow-hidden bg-gray-900 hover:shadow-lg transition-shadow"
          >
            <div className="aspect-square relative bg-gradient-to-br from-purple-500 via-pink-500 to-green-500">
              {/* Placeholder for the art */}
            </div>
            <div className="p-3">
              <div className="text-xs text-gray-400">44px44</div>
              <div className="font-medium truncate">PLANET QU</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
