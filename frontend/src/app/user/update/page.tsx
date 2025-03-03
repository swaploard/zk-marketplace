"use client";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRef, useState } from "react";
import {
  Copy,
  Globe,
  HelpCircle,
  Instagram,
  Twitter,
  Pencil,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { handlePromiseToaster } from "@/components/toaster/promise";

import useUserStore, { IUserStore } from "../../../store/userSlice";

export const profileFormSchema = z.object({
  username: z.string().min(1, "Username is required"),
  bio: z.string().min(1, "Bio is required"),
  email: z.string().email(),
  links: z.string().url().optional().or(z.literal("")),
  profileImage: z.string(),
  profileBanner: z.string(),
  walletAddress: z.string(),
});

export type ProfileFormValues = z.infer<typeof profileFormSchema>;

export default function ProfileUpdate() {
  const { user, error, loading, updateUser } = useUserStore((state: IUserStore) => state);
  const [isHoveringProfile, setIsHoveringProfile] = useState(false);
  const [isHoveringBanner, setIsHoveringBanner] = useState(false);
  const [profileImage, setProfileImage] = useState<string>(
    user?.profileImage || ""
  );
  const [bannerImage, setBannerImage] = useState<string>(
    user?.profileBanner || ""
  );

  const profileImageInputRef = useRef<HTMLInputElement>(null);
  const bannerImageInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isValid, isDirty, isSubmitted },
    setValue,
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      username: user?.username || "",
      bio: user?.bio || "",
      email: user?.email || "",
      links: "",
      profileImage: user?.profileImage || "",
      profileBanner: user?.profileBanner || "",
      walletAddress: user?.walletAddress || "",
    },
  });

  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setProfileImage(event.target.result as string);
          setValue("profileImage", event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBannerImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setBannerImage(event.target.result as string);
          setValue("profileBanner", event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data: ProfileFormValues) => {
    const formData = new FormData();

    formData.append("username", data.username);
    formData.append("bio", data.bio);
    formData.append("email", data.email);
    formData.append("walletAddress", data.walletAddress);

    const profileFile = profileImageInputRef.current?.files?.[0];
    if (profileFile) {
      formData.append("profileImage", profileFile);
    } else if (user?.profileImage) {
      formData.append("profileImage", user.profileImage);
    }

    const bannerFile = bannerImageInputRef.current?.files?.[0];
    if (bannerFile) {
      formData.append("profileBanner", bannerFile);
    } else if (user?.profileBanner) {
      formData.append("profileBanner", user.profileBanner);
    }
    handlePromiseToaster(updateUser(formData), error, "Updating...", "Updated Successfully");

    reset(data, {
      keepValues: true, 
      keepDirty: false, 
    });
  };
  return (
    <div className="min-h-screen bg-black text-white p-6 flex justify-center">
      <div className="w-full max-w-4xl grid md:grid-cols-[1fr_300px] gap-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="username" className="text-lg font-medium">
              Username
            </label>
            <Input
              id="username"
              placeholder="Enter username"
              className="bg-black border-gray-700 text-white h-12 rounded-md"
              {...register("username")}
            />
            {errors.username && (
              <p className="text-red-500 text-sm">{errors.username.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="bio" className="text-lg font-medium">
              Bio
            </label>
            <Textarea
              id="bio"
              placeholder="Tell the world your story!"
              className="bg-black border-gray-700 text-white min-h-[100px] rounded-md"
              {...register("bio")}
            />
            {errors.bio && (
              <p className="text-red-500 text-sm">{errors.bio.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="email" className="text-lg font-medium">
              Email Address
            </label>
            <Input
              id="email"
              type="email"
              placeholder="Enter email"
              className="bg-black border-gray-700 text-white h-12 rounded-md"
              {...register("email")}
            />
            {errors.email && (
              <p className="text-red-500 text-sm">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium">Social Connections</h3>
              <p className="text-sm text-gray-400">
                Help collectors verify your account by connecting social
                accounts
              </p>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Twitter className="text-gray-400" />
                <span>Twitter</span>
              </div>
              <Button
                type="button"
                className="bg-blue-500 hover:bg-blue-600 text-white rounded-md"
              >
                Connect
              </Button>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Instagram className="text-gray-400" />
                <span>Instagram</span>
              </div>
              <Button
                type="button"
                className="bg-blue-500 hover:bg-blue-600 text-white rounded-md"
              >
                Connect
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="website" className="text-lg font-medium">
              Links
            </label>
            <div className="relative">
              <Globe className="absolute left-3 top-3.5 text-gray-400" />
              <Input
                id="website"
                placeholder="yoursite.io"
                className="bg-black border-gray-700 text-white h-12 pl-10 rounded-md"
                {...register("links")}
              />
            </div>
            {errors.links && (
              <p className="text-red-500 text-sm">{errors.links.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-lg font-medium">Wallet Address</label>
            <div className="flex items-center gap-2">
              <Input
                id="walletAddress"
                className="bg-black border-gray-700 text-white"
                {...register("walletAddress")}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-gray-400"
                onClick={() => navigator.clipboard.writeText("0x704c...3340")}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            {errors.walletAddress && (
              <p className="text-red-500 text-sm">
                {errors.walletAddress.message}
              </p>
            )}
          </div>

          <input
            type="file"
            accept="image/*"
            ref={profileImageInputRef}
            onChange={handleProfileImageChange}
            className="hidden"
          />
          <input
            type="file"
            accept="image/*"
            ref={bannerImageInputRef}
            onChange={handleBannerImageChange}
            className="hidden"
          />

          <Button
            type="submit"
            className={`${
              !isDirty || !isValid || isSubmitting
                ? "bg-gray-600 hover:bg-gray-600 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            } text-white px-8 py-2 rounded-md transition-colors`}
            disabled={!isDirty || !isValid || isSubmitting}
          >
            {isSubmitting ? "Saving..." : "Save"}
          </Button>
        </form>

        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex items-center gap-1">
              <span className="text-lg font-medium">Profile Image</span>
              <HelpCircle className="h-4 w-4 text-gray-400" />
            </div>
            <div
              className="relative w-36 h-36 rounded-full mx-auto cursor-pointer"
              onMouseEnter={() => setIsHoveringProfile(true)}
              onMouseLeave={() => setIsHoveringProfile(false)}
              onClick={() => profileImageInputRef.current?.click()}
            >
              <div
                className={`w-full h-full rounded-full bg-cover bg-center ${
                  !profileImage &&
                  "bg-gradient-to-br from-pink-500 to-purple-500"
                }`}
                style={{
                  backgroundImage: profileImage
                    ? `url(${profileImage})`
                    : undefined,
                }}
              >
                {isHoveringProfile && (
                  <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                    <Pencil className="h-6 w-6 text-white" />
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-1">
              <span className="text-lg font-medium">Profile Banner</span>
              <HelpCircle className="h-4 w-4 text-gray-400" />
            </div>
            <div
              className="relative w-full h-28 bg-gray-800 rounded-md cursor-pointer"
              onMouseEnter={() => setIsHoveringBanner(true)}
              onMouseLeave={() => setIsHoveringBanner(false)}
              onClick={() => bannerImageInputRef.current?.click()}
            >
              <div
                className="w-full h-full rounded-md bg-cover bg-center"
                style={{
                  backgroundImage: bannerImage
                    ? `url(${bannerImage})`
                    : undefined,
                }}
              >
                {isHoveringBanner && (
                  <div className="absolute inset-0 bg-black/50 rounded-md flex items-center justify-center">
                    <Pencil className="h-6 w-6 text-white" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
