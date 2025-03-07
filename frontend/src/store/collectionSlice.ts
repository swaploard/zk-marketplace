import { create } from "zustand";
import { axiosInstance } from "@/axios/index";
import { COLLECTION_PROFILE_URL } from "../ApiEndpoints/pinataEndpoints";
import { File } from "@/types";

export interface ICollectionStore {
  collections: File[];
  error: string | null;
  loading: boolean;
  getCollections: (walletAddress: string) => void;
  createCollection: (collection: File) => void;
}

const useCollectionStore = create<ICollectionStore>((set) => ({
  collections: [],
  error: null,
  loading: false,

  getCollections: async (walletAddress) => {
    set({ loading: true, error: null });
    try {
      const response = await axiosInstance.get(
        `${COLLECTION_PROFILE_URL}?walletAddress=${encodeURIComponent(walletAddress)}`,
      );

      if (response.status === 200) {
        set({ collections: response.data, loading: false });
      } else {
        set({ error: "Failed to fetch collections", loading: false });
      }
    } catch (error) {
      set({ error: error.message || "An error occurred", loading: false });
    }
  },

  createCollection: async (collection) => {
    set({ loading: true, error: null });
    try {
      const response = await axiosInstance.post(
        COLLECTION_PROFILE_URL,
        collection,
        {
          responseType: "json",
        },
      );
      if (response.status === 201) {
        set((state) => ({
          collections: [...state.collections, response.data],
          loading: false,
        }));
      } else {
        set({ error: "Failed to create collection", loading: false });
      }
    } catch (error) {
      set({ error: error.message || "An error occurred", loading: false });
    }
  },
}));

export default useCollectionStore;
