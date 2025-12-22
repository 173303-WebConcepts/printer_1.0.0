import React from "react";
import { View, TouchableOpacity } from "react-native";
import { ThemedText } from "../../widgets/ThemeText";

type TopTabsProps = {
  tabs: string[];
  activeTab: string;
  onTabPress: (tab: string) => void;
};

export default function TopTabs({ tabs, activeTab, onTabPress }: TopTabsProps) {
  return (
    <View className="flex-row justify-around mb-4 bg-base-200 rounded-md py-2 relative">
      {tabs.map((tab, index) => (
        <TouchableOpacity
          key={tab}
          onPress={() => onTabPress(tab)}
          className={`flex-1 items-center relative ${index !== tabs.length - 1 ? "border-r border-base-content-20" : ""}`} // 👈 only add border if not last
        >
          <ThemedText className={`text-lg ${activeTab === tab ? "text-primary font-grotes-bold" : "text-base-content-70"}`}>
            {tab}
          </ThemedText>

          {/* Full-width underline */}
          {activeTab === tab && <View className="h-[2px] bg-primary rounded-full absolute -bottom-2 left-0 right-0" />}
        </TouchableOpacity>
      ))}
    </View>
  );
}
