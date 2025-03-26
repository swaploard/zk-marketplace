import { create } from "zustand";
import { axiosInstance } from "@/axios/index";
import { COLLECTION_URL } from "../ApiEndpoints/pinataEndpoints";
import { handlePromiseToaster } from "@/components/toaster/promise";
import { collection } from "@/types";

export interface ICollectionStore {
  collection: collection[] | null;
  collections: collection[];
  error: string | null;
  loading: boolean;
  getCollections: (walletAddress: string) => void;
  createCollection: (collection: FormData) => void;
  getLatestCollection: () => collection[] | null;
  updateCollection: (collection: FormData) => void;
  deleteCollection: (id: string, groupId: string) => void;
}


const useCollectionStore = create<ICollectionStore>((set, get) => ({
  collection: null,
  collections: [],
  error: null,
  loading: false,

  getCollections: async (walletAddress) => {
    set({ loading: true, error: null });
    try {
      const response = await axiosInstance.get(
        `${COLLECTION_URL}?walletAddress=${encodeURIComponent(walletAddress)}`,
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
      const promise = await axiosInstance
        .post(COLLECTION_URL, collection, {
          responseType: "json",
        })
        .then((response) => {
          if (response.status === 200) {
            set((state) => {
              return {
                collection: [...response.data],
                loading: false,
              };
            });

          } else {
            set({ error: "Failed to create collection", loading: false });
          }
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
      set({ error: error.message || "An error occurred", loading: false });
    }
  },
  
  updateCollection: (body) => {
    set({ loading: true, error: null });
    try{
       const promise = axiosInstance.put(COLLECTION_URL, body, {
         responseType: "json",
       })
       console.log("addWalletAddress", promise)
    }catch(error){
      set({ error: error.message || "An error occurred", loading: false });
    }
  },

  deleteCollection: async(id, groupId) => {
    set({ loading: true, error: null });
    try{
       const promise = await axiosInstance.delete(`${COLLECTION_URL}?id=${encodeURIComponent(id)}&groupId=${encodeURIComponent(groupId)}`, {
         responseType: "json",
       })
    }catch(error){
      set({ error: error.message || "An error occurred", loading: false });
    }
  },

  getLatestCollection: () =>{
    const collection = get().collection;
     return collection;
  }
}));

export default useCollectionStore;
