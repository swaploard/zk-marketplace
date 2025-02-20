import axios from "axios";
import toast from 'react-hot-toast';

export const useAxios = () => {

  const axiosInstance = axios.create({
    timeout: 10000,
    withCredentials: true
  });

  axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (axios.isAxiosError(error)) {
        console.error("API Error:", error.response?.data || error.message);
  
        if (error.response?.status === 401) {
          toast.error("Unauthorized! Please log in again.");
        }
      } else {
        console.error("Unexpected Error:", error);
      }
  
      return Promise.reject(error); 
    }
  );

  return { axiosInstance };
};
