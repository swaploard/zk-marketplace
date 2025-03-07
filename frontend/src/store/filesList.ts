import { create } from "zustand";
import { axiosInstance } from "@/axios/index";
import { PIN_FILE_TO_IPFS_URL } from "../ApiEndpoints/pinataEndpoints";

const useFilesList = create((set) => ({
  files: [],
  error: null,
  loading: false,

  getFiles: async () => {
    set({ loading: true, error: null });

    try {
      const response = await axiosInstance.get(
        `${PIN_FILE_TO_IPFS_URL}?list=true`,
      );
      if (response.status === 200) {
        set({ files: response.data, loading: false });
      } else {
        set({ error: "Failed to fetch files", loading: false });
      }
    } catch (error) {
      set({ error: error.message || "An error occurred", loading: false });
    }
  },

  reset: () => {
    set({
      files: [],
      error: null,
      loading: false,
    });
  },
}));

export default useFilesList;
