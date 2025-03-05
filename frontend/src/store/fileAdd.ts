import { create } from "zustand";
import { useAxios } from "@/axios/index";
import { PIN_FILE_TO_IPFS_URL } from "../ApiEndpoints/pinataEndpoints";

const { axiosInstance } = useAxios();

const useAddFile = create((set, get) => ({
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

export interface FileStoreState {
  file: any;
  previewUrl: string | null;
  loading: boolean;
  error: string | null;
  addFile: (formData: FormData) => Promise<void>;
}
