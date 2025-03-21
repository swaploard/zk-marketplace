import { create } from "zustand";
import { axiosInstance } from "@/axios/index";
import { PIN_FILE_TO_IPFS_URL } from "../ApiEndpoints/pinataEndpoints";
import { handlePromiseToaster } from "@/components/toaster/promise";
import {IFileStore} from "@/types"


const useHandleFiles = create<IFileStore>((set, get) => ({
  file: null,
  files: [],
  previewUrl: null,
  loading: false,
  success: false,
  error: null,

  getFiles: async (collection, walletAddress) => {
    set({ loading: true, error: null });

    try {
      const response = await axiosInstance.get(
        `${PIN_FILE_TO_IPFS_URL}?collection=${encodeURIComponent(collection)}&walletAddress=${encodeURIComponent(walletAddress)}`,
      );

      if (response.status >= 200 && response.status < 300) {
        set({
          files: response.data.files || [],
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
              loading: false,
              success: true,
            }));
          } else {
            set({ error: "Failed to upload file", loading: false });
          }
          return response;
        });

      handlePromiseToaster(
        promise,
        {
          title: "Creation Error",
          message: "Failed to create collection",
        },
        {
          title: "Creating Collection",
          message: "Your collection is being created",
        },
        {
          title: "Success!",
          message: "Collection created successfully",
        },
      );
    } catch (error) {
      const errorMessage = error.message || "Failed to upload file";
      set({ error: errorMessage, loading: false });
    }
  },

  updateFiles: async (body) => {
    set({ loading: true, error: null });
    try {
      const promise = axiosInstance.put(PIN_FILE_TO_IPFS_URL,  JSON.stringify(body));
      const response = await promise;
      
      if (response.status === 200) {
        set({ loading: false, success: true });
      } else {
        set({ error: "Failed to update metadata", loading: false });
      }
  
      // Consider moving this to a separate utility function
      handlePromiseToaster(
        promise,
        {
          title: "Update Error",
          message: "Failed to update collection metadata",
        },
        {
          title: "Updating Metadata",
          message: "Your collection metadata is being updated",
        },
        {
          title: "Success!",
          message: "Metadata updated successfully",
        },
      );
      } catch (error) {
      const errorMessage = error.response?.data?.error || error.message || "Failed to update metadata";
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },

  getLatestFile: () => {
    const latestFile = get().file;
    return latestFile;
  },

  clearError: () => set({ error: null }),
}));

export default useHandleFiles;
