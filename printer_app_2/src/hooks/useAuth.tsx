import { useState, useEffect } from "react";
import axios from "axios";
import { axiosInstance } from "../utils/axios";

const useAuth = () => {
  const [isAuth, setIsAuth] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


  useEffect(() => {
    const checkAuth = async () => {
      try {
        setIsAuth(null);
        setLoading(true);

        const res = await axiosInstance.get(`/auth/protected`);

        if (res?.data?.success) {
          setIsAuth(true);
        }
      } catch (err: any) {
        setError(err?.response?.data?.message);
        setIsAuth(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  return { isAuth, loading, error };
};

export default useAuth;
