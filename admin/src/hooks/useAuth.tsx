"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { usePathname } from "next/navigation";
import { useRouter } from "nextjs-toploader/app";

const useAuth = () => {
  const [isAuth, setIsAuth] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const pathname = usePathname();
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        setIsAuth(null);
        setLoading(true);

        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/protected`, {
          withCredentials: true,
        });

        if (res?.data?.success) {
          setIsAuth(true);
          // router.push("/admin/dashboard")
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
  // }, [pathname]);

  return { isAuth, loading, error, pathname };
};

export default useAuth;
