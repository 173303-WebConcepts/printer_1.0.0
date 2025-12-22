import React, { useState } from "react";
import { View } from "react-native";
import KeypadScreen from "./keypad/Keypad";
import TopBottomNav from "../../layouts/TopBottomNav";
import TopTabs from "./TopTab";
import ItemsScreen from "./items/Items";
import FavouriteItemsScreen from "./favourite-items/FavouriteItems";

export default function CounterScreen() {
  const [activeTab, setActiveTab] = useState<"Keypad" | "Products" | "Top Products">("Products");
  const [charges, setCharges] = useState<{ description: string; amount: number }[]>([]);
  const [currentAmount, setCurrentAmount] = useState("");
  const [description, setDescription] = useState("");

  const handleKeyPress = (digit: string) => {
    if (digit === "C") {
      setCurrentAmount("");
    } else {
      setCurrentAmount(prev => prev + digit);
    }
  };

  const handleAddCharge = () => {
    if (!currentAmount) return;
    setCharges(prev => [
      ...prev,
      {
        description: description || `Item ${prev.length + 1}`,
        amount: parseFloat(currentAmount),
      },
    ]);
    setCurrentAmount("");
    setDescription("");
  };

  const total = charges.reduce((sum, c) => sum + c.amount, 0);

  return (
    <TopBottomNav>
      <View className="flex-1">
        {/* Reusable Tabs */}
        <TopTabs tabs={["Products", "Top Products"]} activeTab={activeTab} onTabPress={(tab: any) => setActiveTab(tab as any)} />

        {/* Dynamic Tab Content */}
        {/* {activeTab === "Keypad" && <KeypadScreen />} */}

        {activeTab === "Products" && <ItemsScreen key="products" activeTab="Products" />}

        {activeTab === "Top Products" && <ItemsScreen key="top-products" activeTab="Top Products" />}

        {/* {activeTab === "Top Products" && <FavouriteItemsScreen />} */}
      </View>
    </TopBottomNav>
  );
}
