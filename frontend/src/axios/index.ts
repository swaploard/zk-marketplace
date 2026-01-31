import axios from 'axios';
import toast from 'react-hot-toast';

export type ApiResponse<T = unknown> = {
  data: T;
  message?: string;
  error?: string;
};

export const axiosInstance = axios.create({
  timeout: 10000,
  withCredentials: true,
  headers: {
    'Content-Type': 'multipart/form-data',
  },
});

interface ApiError {
  message: string;
  status?: number;
  data?: unknown;
}

axiosInstance.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    const apiError: ApiError = {
      message: 'An unexpected error occurred',
      status: 500,
    };


    if (axios.isAxiosError(error)) {
      apiError.message = error.response?.data?.message || error.message;
      apiError.status = error.response?.status;
      apiError.data = error.response?.data;

      if (error.response?.status === 401) {
        toast.error('Session expired - Please log in again');
        // Consider adding redirect logic here
      }
    } else if (error instanceof Error) {
      apiError.message = error.message;
    }

    console.error('API Error:', apiError);
    toast.error(apiError.message);
    return Promise.reject(apiError);
  }
);
