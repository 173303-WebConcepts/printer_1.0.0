import axios, { AxiosRequestConfig, AxiosInstance, AxiosResponse } from "axios";

export const base_url = process.env.NEXT_PUBLIC_API_BASE_URL as string;

let p_axiosInstance: AxiosInstance | null = null;

interface CustomAxiosRequestConfig extends AxiosRequestConfig {
  showSuccessToast?: boolean;
}

const createAxiosInstance = () => {
  p_axiosInstance = axios.create({
    baseURL: base_url,
    headers: {
      "Access-Control-Allow-Origin": "*", // Use wildcard or specify a domain
      "Content-Type": "application/json",
    },
    withCredentials: true,
  });

  // Request interceptor
  p_axiosInstance.interceptors.request.use(
    function (config: any) {
      // const token = localStorage.getItem("accessToken");

      // config.headers = {
      //   ...config.headers,
      //   Authorization: token ? `Bearer ${JSON.parse(token)}` : "",
      // };

      // if (config.showSuccessToast) {
      //   config.headers["Show-Success-Toast"] = "true";
      // }

      return config;
    },
    function (error) {
      return Promise.reject(error);
    }
  );

  // Response interceptor
  p_axiosInstance.interceptors.response.use(
    function (response: AxiosResponse) {
      // const showSuccessToast = response.config.headers["Show-Success-Toast"];
      // if (showSuccessToast) {
      //   Toast.success("SUCCESS");
      // }

      return response;
    },
    function (error) {
      const errorResponse = error.response;

      // if (errorResponse?.data?.message) {
      //   Toast.error(errorResponse.data.message);
      // } else {
      //   Toast.error("An error occurred");
      // }

      return Promise.reject(error);
    }
  );
};

export const getAxiosInstance = (): AxiosInstance => {
  if (!p_axiosInstance) {
    createAxiosInstance();
  }
  return p_axiosInstance!;
};

const axiosInstance = getAxiosInstance();

export { axiosInstance };
