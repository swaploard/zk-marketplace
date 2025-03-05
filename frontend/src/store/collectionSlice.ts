// stores/collectionStore.ts
import { create } from "zustand";
import { useAxios } from "@/axios/index";
import { COLLECTION_PROFILE_URL } from "../ApiEndpoints/pinataEndpoints";

const { axiosInstance } = useAxios();

export interface ICollectionStore {
  collections: any[];
  error: string | null;
  loading: boolean;
  getCollections: () => void;
  createCollection: (collection: any) => void;
  updateCollection: (id: string, collection: any) => void;
}

const useCollectionStore = create<ICollectionStore>((set) => ({
  collections: [],
  error: null,
  loading: false,

  getCollections: async () => {
    set({ loading: true, error: null });
    try {
      const response = await axiosInstance.get(COLLECTION_PROFILE_URL);
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
          responseType: 'json',
        }
      );
      if (response.status === 201) {
        set((state) => ({
          collections: [...state.collections, response.data],
          loading: false
        }));
      } else {
        set({ error: "Failed to create collection", loading: false });
      }
    } catch (error) {
      set({ error: error.message || "An error occurred", loading: false });
    }
  },

  updateCollection: async (id, collection) => {
    set({ loading: true, error: null });
    try {
      const response = await axiosInstance.put(
        `${COLLECTION_PROFILE_URL}/${id}`,
        collection,
        {
          headers: { 'Content-Type': 'application/json' },
          responseType: 'json',
        }
      );
      if (response.status === 200) {
        set((state) => ({
          collections: state.collections.map((c) =>
            c.id === id ? response.data : c
          ),
          loading: false
        }));
      } else {
        set({ error: "Failed to update collection", loading: false });
      }
    } catch (error) {
      set({ error: error.message || "An error occurred", loading: false });
    }
  },
}));

export default useCollectionStore;