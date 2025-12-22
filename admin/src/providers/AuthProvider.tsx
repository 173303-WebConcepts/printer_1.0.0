"use client";
import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import useAuth from "@/hooks/useAuth";
import { setUser, userAuthCheck } from "@/redux/slices/authSlice";
import { useSelector, useDispatch } from "react-redux";
import { AppDispatch } from "@/redux/store";
import { axiosInstance } from "@/utils/axios";

const rolePaths: Record<string, string[]> = {
  public: ["/"],
  superAdmin: [
    "/admin/dashboard",
    "/admin/gallery/list",
    "/admin/gallery/add",
    "/admin/user/product/list",
    "/admin/user/product/add",
    "/admin/user/category/list",
    "/admin/user/brand/list",
    "/admin/user/list",
    "/admin/user/shop-setup", // commented intentionally
    "/admin/user/add",
    "/admin/user/details",
    "/admin/project/list",
    "/admin/project/add",
    "/admin/project/details",
    "/admin/category/list",
    "/admin/brand/list",
    "/admin/business-model/list",
    "/admin/technology/list",
    "/admin/shop-types/list",
  ],
  admin: [
    "/admin/dashboard",
    "/admin/user/product/add",
     "/admin/user/category/list",
    "/admin/user/list",
    "/admin/user/shop-setup",
    "/admin/user/add",
    "/admin/user/details",
    "/admin/project/list",
    "/admin/project/add",
    "/admin/project/details",
    "/admin/category/list",
    "/admin/business-model/list",
    "/admin/technology/list",
    "/admin/shop-types/list",
  ],
};

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { isAuth, loading, pathname } = useAuth();
  const { userInfo = {} } = useSelector((state: any) => state.auth);
  const searchParams = useSearchParams();
  const isAuthenticated = searchParams.get("isAuthenticated");

  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  // Fetch user when redirected from OAuth
  useEffect(() => {
    if (isAuth && isAuthenticated) getUser();
  }, [isAuth, isAuthenticated]);

  // Load user if empty
  useEffect(() => {
    if (Object.keys(userInfo).length === 0) dispatch(userAuthCheck());
  }, []);

  // Auth route control
  useEffect(() => {
    if (loading) return;

    const userRole = userInfo?.user?.role || "public";
    const allowedPaths = rolePaths[userRole] || [];

    const isPublic = rolePaths.public.some(
      (p) => pathname === p || pathname.startsWith(`${p}/`)
    );

    const isAllowed = allowedPaths.some(
      (p) => pathname === p || pathname.startsWith(`${p}/`)
    );

    // 🚫 Unauthenticated user
    if (isAuth === false && !isPublic) {
      console.log("22:::", isAuth, isPublic)
      router.push("/");
      return;
    }

    // 🚫 Authenticated but restricted route
    // if (isAuth !==null && isAuth && !isPublic && !isAllowed) {
    //   console.log("22:::00", isAuth, !isPublic, !isAllowed)
    //   router.push("/");
    //   return;
    // }
  }, [isAuth, pathname, userInfo]);

  const getUser = async () => {
    try {
      const res = await axiosInstance.get("/user/get");
      if (res?.data?.data?.user) {
        dispatch(setUser({ user: res.data.data.user }));
        router.replace("/admin/dashboard");
      }
    } catch (error) {
      console.error("Failed to fetch user:", error);
    }
  };

  if (loading) return null;
  return <>{children}</>;
};

export default AuthProvider;
