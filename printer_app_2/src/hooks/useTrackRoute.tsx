import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setCurrentRouteName } from "../redux/slices/commonSlice";
import { navigationRef } from "@/App";

export const useTrackRoute = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const unsubscribe = navigationRef.addListener("state", () => {
      const route = navigationRef.getCurrentRoute()?.name || "";
      dispatch(setCurrentRouteName(route));
    });

    return unsubscribe;
  }, []);
};
