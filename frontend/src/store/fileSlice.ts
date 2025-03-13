import { create } from "zustand";
import { axiosInstance } from "@/axios/index";
import { PIN_FILE_TO_IPFS_URL } from "../ApiEndpoints/pinataEndpoints";
import { handlePromiseToaster } from "@/components/toaster/promise";

export interface PinataFile {
  id: string;
  ipfs_pin_hash: string;
  size: number;
  user_id: string;
  date_pinned: string;
  date_unpinned: string | null;
  metadata: {
    name: string;
    keyvalues: {
      name: string;
      supply: number;
      description: string;
      externalLink: string;
    };
  };
  regions: {
    regionId: string;
    currentReplicationCount: number;
    desiredReplicationCount: number;
  }[];
  mime_type: string;
  number_of_files: number;
}

export interface IFileStore {
  files: PinataFile[];
  previewUrl: string | null;
  loading: boolean;
  error: string | null;
  success: boolean;
  addFile: (formData: FormData) => Promise<void>;
  getFiles: (
    collection?: string,
    walletAddress?: string | null,
  ) => Promise<void>;
  clearError: () => void;
}

const useHandleFiles = create<IFileStore>((set) => ({
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
              files: [...state.files, response.data.files],
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

  clearError: () => set({ error: null }),
}));

export default useHandleFiles;
