import { create } from 'zustand';
import { axiosInstance } from '@/axios/index';
import { USER_PROFILE_URL } from '../ApiEndpoints/pinataEndpoints';
import { user } from '@/types';

export interface IUserStore {
  user: user;
  error: string | null;
  loading: boolean;
  getUser: (walletAddress: string) => void;
  createUser: (user: { walletAddress: string }) => void;
  updateUser: (user: FormData) => void;
}

const useUserStore = create((set) => ({
  user: null,
  error: null,
  loading: false,

  getUser: async (walletAddress) => {
    set({ loading: true, error: null });
    try {
      const response = await axiosInstance.get(
        `${USER_PROFILE_URL}?walletAddress=${encodeURIComponent(walletAddress)}`
      );
      if (response.status === 200) {
        set({ user: response.data.user, loading: false });
      } else {
        set({ error: 'Failed to fetch user', loading: false });
      }
    } catch (error) {
      set({ error: error.message || 'An error occurred', loading: false });
    }
    return;
  },

  createUser: async (user) => {
    set({ loading: true, error: null });
    try {
      const response = await axiosInstance.post(USER_PROFILE_URL, user, {
        headers: { 'Content-Type': 'application/json' },
        responseType: 'json',
      });
      if (response.status === 201) {
        set({ user: response.data.user, loading: false });
      } else {
        set({ error: 'Failed to fetch user', loading: false });
      }
    } catch (error) {
      set({ error: error.message || 'An error occurred', loading: false });
    }
  },

  updateUser: async (user) => {
    set({ loading: true, error: null });
    try {
      const response = await axiosInstance.put(USER_PROFILE_URL, user, {
        responseType: 'json',
      });
      if (response.status === 200) {
        set({ user: response.data.user, loading: false });
      } else {
        set({ error: 'Failed to fetch user', loading: false });
      }
    } catch (error) {
      set({ error: error.message || 'An error occurred', loading: false });
    }
  },
}));

export default useUserStore;
