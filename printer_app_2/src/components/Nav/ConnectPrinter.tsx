import { useCallback, useEffect, useState } from "react";
import { View, TouchableOpacity, ActivityIndicator } from "react-native";
import { ThermalPrinter } from "@finan-me/react-native-thermal-printer";
import AppToast from "@/src/widgets/CustomToast";
import { useDispatch, useSelector } from "react-redux";
import AppIcon from "../AppIcon";
import Ionicons from "@react-native-vector-icons/ionicons";
import DashboardSidebar from "./DashboardSidebar";
import { ThemedText } from "@/src/widgets/ThemeText";
import { setPrinterConnected, setPrinterDisconnected } from "@/src/redux/slices/printerSlice";
import { Helper } from "@/src/utils/Helper";

export const EVENT_CONNECTION_STATE_CHANGED = "EVENT_CONNECTION_STATE_CHANGED";

function ConnectPrinter() {
  const [loading, setLoading] = useState(false);

  const [showDrawer, setShowDrawer] = useState(false);

  const dispatch = useDispatch();
  const { connected } = useSelector((state: any) => state.printer);
  const { currentRouteName } = useSelector((state: any) => state.common);

  useEffect(() => {
    dispatch(setPrinterDisconnected());

    if (!connected) {
      discoverPrinters();
    }
  }, []);

  // ✅ Discover available Bluetooth printers
  const discoverPrinters = useCallback(async () => {
    setLoading(true);
    if (connected) {
      AppToast.success("Success", "Printer already connected");
      setLoading(false);
      return;
    }

    try {
      const granted = await Helper.requestBtPermissions();
      if (!granted) {
        AppToast.error("Permission Required", "Please allow Bluetooth & Location");
        setLoading(false);
        return;
      }

      const state = await Helper.ensureBluetoothOn();

      if (state === "PoweredOff") {
        AppToast.error("Bluetooth Premission", "Please enable the bluetooth to connect a printer device");
        setLoading(false);
        return;
      }

      // const p = ThermalPrinter.init();

      const subscription = ThermalPrinter.addDiscoveryEventListener(ThermalPrinter.EVENT_DEVICE_DISCOVER_DONE, event => {
        const paired = JSON.parse(event?.paired || "[]");
        const found = JSON.parse(event?.found || "[]");
        const allDevices = [...paired, ...found];



        if (allDevices && allDevices.length > 0) {
          connectPrinter(allDevices[0]);
        } else {
          setLoading(false);
        }
        if (subscription?.remove) subscription.remove();
      });

      const res = await ThermalPrinter.NativePrinter.scanBluetoothDevices();

    } catch (err) {
      console.error("❌ Discovery error:", err);
    }
  }, [connected]);

  // ✅ Connect to a selected printer
  const connectPrinter = useCallback(
    async (device: any) => {
      try {
        if (!device) return;

        const address = device?.address;
        if (!address) throw new Error("Invalid device address");

        const printerAddress = `bt:${address}`;

        // Use testConnection to verify printer
        const res: any = await ThermalPrinter.NativePrinter.testConnection(printerAddress);


        if (!res.success) {
          AppToast.error("Oops!", res?.error?.suggestion);
          setLoading(false);
          return;
        }

        if (res?.success) {
          await ThermalPrinter.NativePrinter.printRaw(printerAddress, [], { keepAlive: true });

          dispatch(setPrinterConnected(address));

          return AppToast.success("Success", `Connected to ${device.name || address}`);
        } else {
          dispatch(setPrinterDisconnected());
          AppToast.error("Oops!", `Unable to connect to printer`);
          return;
        }
      } catch (err: any) {
        console.error("❌ Connection error:", err);
        dispatch(setPrinterDisconnected());
        AppToast.error("Oops!", `Unable to connect to printer`);
        return;
      } finally {
        setLoading(false);
      }
    },
    [dispatch],
  );

  return (
    <View className="flex-row items-center justify-between px-[10px] py-3 bg-base-100 border-b border-base-content/10">
      {/* Left Drawer Icon */}
      <TouchableOpacity onPress={() => setShowDrawer(true)}>
        <AppIcon IconComponent={Ionicons} name="menu-outline" size={30} className="text-base-content-70" />
      </TouchableOpacity>

      <DashboardSidebar showDrawer={showDrawer} setShowDrawer={setShowDrawer} />

      <ThemedText className="text-lg font-grotes-bold text-base-content">{currentRouteName || "Dashboard"}</ThemedText>

      {loading ? (
        <View className="p-2 rounded-full bg-base-200 relative flex-row items-center justify-center">
          <ActivityIndicator size="small" color="#FD680D" />
        </View>
      ) : (
        <TouchableOpacity onPress={discoverPrinters} className="p-2 rounded-full bg-base-200 relative flex-row items-center justify-center">
          <View className="relative">
            <AppIcon
              IconComponent={Ionicons}
              name={connected ? "checkmark-circle-outline" : "close-circle-outline"}
              size={14}
              className={`${connected ? "text-success" : "text-error"} absolute -top-2 -right-2`}
            />
            <AppIcon IconComponent={Ionicons} name="print" size={24} className={`${connected ? "text-success" : "text-error"}`} />
          </View>
        </TouchableOpacity>
      )}
    </View>
  );
}

export default ConnectPrinter;
