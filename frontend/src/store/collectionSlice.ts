import { create } from "zustand";
import { axiosInstance } from "@/axios/index";
import { COLLECTION_URL } from "../ApiEndpoints/pinataEndpoints";
import {ICollectionStore } from "@/types";

const useCollectionStore = create<ICollectionStore>((set, get) => ({
  collection: null,
  collections: [],
  error: null,
  loading: false,


  getCollections: async (walletAddress, contractAddress) => {
    set({ loading: true, error: null });
    try {
      const response = await axiosInstance.get(
        `${COLLECTION_URL}?walletAddress=${encodeURIComponent(walletAddress)}&contractAddress=${encodeURIComponent(contractAddress)}`,
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
