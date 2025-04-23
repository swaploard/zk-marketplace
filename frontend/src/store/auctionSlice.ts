import { axiosInstance } from '@/axios';
import { create } from 'zustand';
import { AUCTION_URL } from '../ApiEndpoints/pinataEndpoints';
import { IAuctionStore } from '@/types';

const useAuctionStore = create<IAuctionStore>((set) => ({
  auction: null,
  error: null,
  loading: false,

  createAuction: async (auction = {}) => {
    set({ loading: true, error: null });
    try {
      const response = await axiosInstance.post(AUCTION_URL, auction, {
        headers: { 'Content-Type': 'application/json' },
        responseType: 'json',
      });
      if (response.status === 200) {
        set({ auction: response.data, loading: false });
      } else {
        set({ error: 'Failed to fetch auction', loading: false });
      }
    } catch (error) {
      set({ error: error.message || 'An error occurred', loading: false });
    }
  },

  getAuction: async (id) => {
    set({ loading: true, error: null });
    try {
      const response = await axiosInstance.get(`${AUCTION_URL}?fileId=${id}`);
      if (response.status === 200) {
        set({ auction: response.data, loading: false });
      } else {
        set({ error: 'Failed to fetch auction', loading: false });
      }
    } catch (error) {
      set({ error: error.message || 'An error occurred', loading: false });
    }
  },

  updatedAuction: async (id, data) => {
    set({ loading: true, error: null });
    try {
      const response = await axiosInstance.put(
        `${AUCTION_URL}?fileId=${id}`,
        data
      );
      if (response.status === 200) {
        set({ auction: response.data, loading: false });
      } else {
        set({ error: 'Failed to fetch auction', loading: false });
      }
    } catch (error) {
      set({ error: error.message || 'An error occurred', loading: false });
    }
  },
}));

export default useAuctionStore;
