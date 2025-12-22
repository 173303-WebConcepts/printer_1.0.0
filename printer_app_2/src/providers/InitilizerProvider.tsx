import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { createOfflineSettings } from "@/src/database/services/settings.service";
import { setSettings } from "../redux/slices/commonSlice";
import { initializeTokenCounter } from "../database/services/TokenCounter.service";

// This provider should wrap your entire app (e.g., in App.tsx)
const AppInitProvider = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    (async () => {
      try {
        initializeTokenCounter();
        const settings = await createOfflineSettings();

        // 3️⃣ Dispatch to Redux
        if (settings) {
          dispatch(setSettings({ ...settings }));
        }
      } catch (err) {
        console.error("❌ AppInitProvider error:", err);
      }
    })();
  }, [dispatch]);

  return null;
};

export default AppInitProvider;
