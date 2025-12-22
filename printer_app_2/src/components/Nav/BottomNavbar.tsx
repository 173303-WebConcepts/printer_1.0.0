import React from "react";
import { Pressable, View } from "react-native";
import AppIcon from "../AppIcon";
import { ThemedText } from "@/src/widgets/ThemeText";
import { useNavigation, useRoute } from "@react-navigation/native";

const BottomNavbar = () => {
  const navigation = useNavigation();
  const route = useRoute();

  console.log("routeroute::", route);

  return (
    <View className="bg-base-200 flex-row justify-between gap-10 items-center h-[65px] border border-t-base-content-20">
      <Pressable onPress={() => navigation.navigate("Dashboard")} className="flex-1">
        <View className="flex-col items-center justify-center">
          <AppIcon name="grid-outline" className={`${route.name === "Dashboard" ? "text-primary" : ""}`} />
          <ThemedText className={`${route.name === "Dashboard" ? "text-primary" : ""}`}>Dashboard</ThemedText>
        </View>
      </Pressable>
      <Pressable onPress={() => navigation.navigate("Counter")} className="flex-1">
        <View className="flex-col items-center justify-center  ">
          <AppIcon name="wallet-outline" className={`${route.name === "Counter" ? "text-primary" : ""}`} />
          <ThemedText className={`${route.name === "Counter" ? "text-primary" : ""}`}>Cashier</ThemedText>
        </View>
      </Pressable>
      <Pressable onPress={() => navigation.navigate("Settings")} className="flex-1">
        <View className="flex-col items-center justify-center  ">
          <AppIcon name="settings-outline" className={`${route.name === "Settings" ? "text-primary" : ""}`} />
          <ThemedText className={`${route.name === "Settings" ? "text-primary" : ""}`}>Settings</ThemedText>
        </View>
      </Pressable>
    </View>
  );
};

export default BottomNavbar;
