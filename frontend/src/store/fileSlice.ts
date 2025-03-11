import { create } from "zustand";
import { axiosInstance } from "@/axios/index";
import { PIN_FILE_TO_IPFS_URL } from "../ApiEndpoints/pinataEndpoints";

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
  file: PinataFile | null;
  files: PinataFile[];
  previewUrl: string | null;
  loading: boolean;
  error: string | null;
  addFile: (formData: FormData) => Promise<void>;
  getFiles: (collection: string) => Promise<void>;
  clearError: () => void;
}

const useHandleFiles = create<IFileStore>((set) => ({
  file: null,
  files: [],
  previewUrl: null,
  loading: false,
  error: null,

  getFiles: async (collection) => {
    set({ loading: true, error: null });

    try {
      const response = await axiosInstance.get(
        `${PIN_FILE_TO_IPFS_URL}?collection=${encodeURIComponent(collection)}`,
      );

      if (response.status >= 200 && response.status < 300) {
        set({ files: response.data.collection || [], loading: false });
      } else {
        set({ error: "Failed to fetch files", loading: false });
      }
    } catch (error: unknown) {
      const errorMessage =
        error.response?.data?.error?.message ||
        error.message ||
        "Failed to fetch files";
      set({ error: errorMessage, loading: false });
    }
  },

  addFile: async (formData: FormData) => {
    set({ loading: true, error: null });

    try {
      const response = await axiosInstance.post(
        PIN_FILE_TO_IPFS_URL,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      if (response.status >= 200 && response.status < 300) {
        set((state) => ({
          file: response.data,
          files: [...state.files, response.data], // Add new file to the list
          loading: false,
        }));
      } else {
        set({ error: "Failed to upload file", loading: false });
      }
    } catch (error: unknown) {
      const errorMessage =
        error.response?.data?.error?.message ||
        error.message ||
        "Failed to upload file";
      set({ error: errorMessage, loading: false });
    }
  },

  clearError: () => set({ error: null }),
}));

export default useHandleFiles;
