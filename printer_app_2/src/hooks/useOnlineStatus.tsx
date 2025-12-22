import { useEffect, useState } from "react";
import NetInfo from "@react-native-community/netinfo";

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState<boolean>(false);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOnline(state.isConnected === true);
    });

    return () => unsubscribe();
  }, []);

  return isOnline;
}
