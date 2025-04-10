import { create } from "zustand";

import { axiosInstance } from "@/axios/index";
import { PIN_FILE_TO_IPFS_URL } from "../ApiEndpoints/pinataEndpoints";
import { handlePromiseToaster } from "@/components/toaster/promise";
import { IFileStore, PinataFile } from "@/types";

const useHandleFiles = create<IFileStore>((set, get) => ({
  file: null,
  files: [],
  nftList: [],
  previewUrl: null,
  loading: false,
  success: false,
  error: null,

  getFiles: async (contractAddress, walletAddress) => {
    set({ loading: true, error: null });

    try {
      const response = await axiosInstance.get(
        `${PIN_FILE_TO_IPFS_URL}?contractAddress=${encodeURIComponent(contractAddress)}&walletAddress=${encodeURIComponent(walletAddress)}`,
      );
      if (response.status === 200) {
        set({
          files: response.data,
          loading: false,
          success: true,
        });
      } else {
        set({ error: "Failed to fetch files", loading: false });
      }
    } catch (error) {
      const errorMessage = error.message || "Failed to fetch files";
      set({ error: errorMessage, loading: false });
    }
  },

  addFile: async (formData) => {
    set({ loading: true, error: null });
    try {
      const promise = await axiosInstance
        .post(PIN_FILE_TO_IPFS_URL, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          responseType: "json",
        })
        .then((response) => {
          if (response.status === 200) {
            set((state) => ({
              file: response.data,
              files: [...state.files, response.data],
              loading: false,
              success: true,
            }));
          } else {
            set({ error: "Failed to upload file", loading: false });
          }
          return response;
        });
    } catch (error) {
      const errorMessage = error.message || "Failed to upload file";
      set({ error: errorMessage, loading: false });
    }
  },

  updateFiles: async (body) => {
    set({ loading: true, error: null, success: false });
    try {
      const promise = await axiosInstance.put(PIN_FILE_TO_IPFS_URL, body, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      const response = (await promise).data;
      if (promise.status === 200) {
        const currentFiles = get().files;
        const fileIndex = get().files.findIndex(
          (file: PinataFile) => file._id === response._id,
        );

        if (fileIndex === -1) {
          throw new Error("File not found in store");
        }

        const newFiles = [
          ...currentFiles.slice(0, fileIndex),
          response,
          ...currentFiles.slice(fileIndex + 1),
        ];
        set((state) => ({
          ...state,
          files: newFiles,
          loading: false,
          success: true,
        }));
      }
    } catch (error) {
      console.error("Update error:", error);
      const errorMessage =
        error.response?.data?.error ||
        error.message ||
        "Failed to update metadata";

      set({ error: errorMessage, loading: false });
    }
  },

  addTokenData: async (body, id) => {
    set({ loading: true, error: null });
    try {
      const promise = await axiosInstance.put(
        `${PIN_FILE_TO_IPFS_URL}?id=${encodeURIComponent(id)}`,
        body,
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
      if (promise.status === 200) {
        set({ loading: false, success: true });
      } else {
        set({ error: "Failed to update metadata", loading: false });
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.error ||
        error.message ||
        "Failed to update metadata";
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },

  deleteFile: async (cid) => {
    set({ loading: true, error: null });
    try {
      const promise = await axiosInstance.delete(
        `${PIN_FILE_TO_IPFS_URL}?cid=${encodeURIComponent(cid)}`,
        {
          responseType: "json",
        },
      );
    } catch (error) {
      set({ error: error.message || "An error occurred", loading: false });
    }
  },

  getLatestFile: () => {
    const latestFile = get().file;
    return latestFile;
  },
  clearError: () => set({ error: null }),
}));

export default useHandleFiles;
