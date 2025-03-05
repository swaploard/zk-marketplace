import { create } from "zustand";
import {useAxios} from "@/axios/index";
import {USER_PROFILE_URL} from "../ApiEndpoints/pinataEndpoints";

const { axiosInstance } = useAxios();

export interface IUserStore {
    user: any;
    error: string | null;
    loading: boolean;
    getUser: () => void;
    createUser: (user: any) => void;
    updateUser: (user: any) => void;
  }

const useUserStore = create((set) => ({
    user: null,
    error: null,
    loading: false,

    getUser: async () => {      
        set({ loading: true, error: null });
        try {
            const response = await axiosInstance.get(USER_PROFILE_URL);
            if (response.status === 200) {
                set({ user: response.data, loading: false });
            } else {
                set({ error: "Failed to fetch user", loading: false });
            }
        } catch (error) {
            set({ error: error.message || "An error occurred", loading: false });
        }
    },  

    createUser: async (user) => {
        set({ loading: true, error: null });
        try {
            const response = await axiosInstance.post(USER_PROFILE_URL,user, {
                headers: { 'Content-Type': 'application/json' },
                responseType: 'json',
            });
            if (response.status === 201) {
                set({ user: response.data.user, loading: false });
            } else {
                set({ error: "Failed to fetch user", loading: false });
            }
        } catch (error) {
            set({ error: error.message || "An error occurred", loading: false });
        }
    },

    updateUser: async (user) => {
        set({ loading: true, error: null });
        try {
            const response = await axiosInstance.put(USER_PROFILE_URL, user, {
                responseType: 'json',
            });
            if (response.status === 201) {
                set({ user: response.data.user, loading: false });
            } else {
                set({ error: "Failed to fetch user", loading: false });
            }
        } catch (error) {
            set({ error: error.message || "An error occurred", loading: false });
        }
    },
}));

export default useUserStore;


