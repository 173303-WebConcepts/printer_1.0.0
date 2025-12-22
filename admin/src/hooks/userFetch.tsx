import { useEffect, useState, useCallback } from "react";
import axios, { AxiosRequestConfig } from "axios";
import { axiosInstance } from "@/utils/axios";

interface UseFetchOptions extends AxiosRequestConfig {
  manual?: boolean; // optional flag for lazy fetch
}

export function useFetch<T = any>(url: string, options?: UseFetchOptions) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await axiosInstance(url, options);
      setData(response.data);
    } catch (err: any) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, [url, JSON.stringify(options)]); // options can be unstable; stringify if needed

  useEffect(() => {
    if (!options?.manual) {
      fetchData();
    }
  }, [fetchData, options?.manual]);

  return { data, error, isLoading, refetch: fetchData };
}
