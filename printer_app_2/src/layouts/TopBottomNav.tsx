import React, { useState } from "react";
import { TouchableOpacity, View } from "react-native";
import DashboardSidebar from "../components/Nav/DashboardSidebar";
import AppIcon from "../components/AppIcon";
import BottomNavbar from "../components/Nav/BottomNavbar";
// import ConnectPrinter from "../components/Nav/ConnectPrinter";

// const MemoConnectPrinter = React.memo(ConnectPrinter);

export default function TopBottomNav({ children }: { children: React.ReactNode }) {
  return (
    <View className="flex-1 bg-base-100 pt-[14px]" >
      {/* Top Navigation */}
      {/* <MemoConnectPrinter /> */}

      {/* Left Drawer Icon */}
      {/* <TouchableOpacity onPress={() => setShowDrawer(true)} className="absolute -top-[16px] z-[99999] right-1">
        <AppIcon name="menu-outline" size={30} className="text-base-content-70" />
      </TouchableOpacity> */}

      {/* <DashboardSidebar showDrawer={showDrawer} setShowDrawer={setShowDrawer} /> */}

      {/* Middle Content */}
      <View className="flex-1 px-[10px]">{children}</View>

      {/* Bottom Navigation */}
      <BottomNavbar />
    </View>
  );
}
