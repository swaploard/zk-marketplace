import { create } from "zustand";
import { axiosInstance } from "@/axios/index";
import { PIN_FILE_TO_IPFS_URL } from "../ApiEndpoints/pinataEndpoints";
import { File } from "@/types";

export interface IFileStore {
  file: File;
  previewUrl: string | null;
  loading: boolean;
  error: string | null;
  addFile: (formData: FormData) => Promise<void>;
}

const useAddFile = create((set) => ({
  file: null,
  previewUrl: null,
  loading: false,
  error: null,

  addFile: async (formData: FormData) => {
    set({ loading: true, error: null });

    try {
      const response = await axiosInstance.post(PIN_FILE_TO_IPFS_URL, formData);
      if (response.status === 200) {
        set({ file: response.data, loading: false });
      } else {
        set({ error: "Failed to fetch files", loading: false });
      }
    } catch (error) {
      set({ error: error.message || "An error occurred", loading: false });
    }
  },
}));

export default useAddFile;
