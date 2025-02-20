import axios from "axios";

export const useAxios = () => {

  const axiosInstance = axios.create({
    timeout: 10000,
    withCredentials: true
  });

  return { axiosInstance };
};
