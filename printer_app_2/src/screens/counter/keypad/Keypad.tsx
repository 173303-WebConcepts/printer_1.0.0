import React, { useState } from "react";
import { View, TextInput, TouchableOpacity, FlatList } from "react-native";
import TopTabs from "../TopTab";
import { ThemedText } from "../../../widgets/ThemeText";
import TopBottomNav from "../../../layouts/TopBottomNav";
import AppIcon from "../../../components/AppIcon";
import Ionicons from "@react-native-vector-icons/ionicons";
import CustomTextInput from "../../../widgets/CustomTextInput";
import { PrimaryButton } from "../../../widgets/Button";
import ItemsScreen from "../items/Items";
import FavouriteItemsScreen from "../favourite-items/FavouriteItems";

export default function KeypadScreen() {
  const [activeTab, setActiveTab] = useState<"Keypad" | "Items" | "Favourites">("Items");
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
    <View className="flex-1 justify-between">
      {/* Items + Total Section */}
      <View className="flex-1 mb-3">
        <View className="border border-base-content-20 px-3 rounded-t-md flex-1">
          <FlatList
            data={charges}
            keyExtractor={(_, i) => i.toString()}
            renderItem={({ item, index }) => (
              <View className="flex-row items-center justify-between py-2">
                {/* Cancel Button */}
                <TouchableOpacity onPress={() => setCharges(prev => prev.filter((_, i) => i !== index))} className="mr-3">
                  <AppIcon IconComponent={Ionicons} name="close-circle" size={22} className="text-error" />
                </TouchableOpacity>

                {/* Description */}
                <ThemedText className="flex-1 text-base">{item.description}</ThemedText>

                {/* Amount */}
                <ThemedText className="text-base font-grotes-bold">Rs. {item.amount.toLocaleString("en-PK")}</ThemedText>
              </View>
            )}
            ItemSeparatorComponent={() => <View className="h-[1px] bg-base-content/10" />}
            ListEmptyComponent={<ThemedText className="!text-base-content-2 text-center mt-4">No charges yet</ThemedText>}
          />
        </View>

        {/* Total */}
        <View className="flex-row justify-between items-center border-b border-l border-r border-base-content-20 rounded-b-md px-3 py-2">
          <ThemedText className="text-lg font-grotes-bold pl-1 !text-primary">Total</ThemedText>
          <ThemedText className="text-lg font-grotes-bold !text-primary">Rs. {total.toLocaleString("en-PK")}</ThemedText>
        </View>
      </View>

      {/* Keypad + Input */}
      <View>
        <View className="rounded-lg bg-base-200 ">
          {/* Input Row */}
          <View className="flex-row gap-2 items-center justify-center border-b border-base-content-2/20">
            {/* Description Input */}
            <View className="flex-1">
              <CustomTextInput
                label="Note"
                placeholder="Enter a note"
                icon="notebook"
                value={description}
                onChangeText={setDescription}
                autoCapitalize="none"
                IconComponent={SimpleLineIcons}
              />
            </View>

            {/* Amount Box */}
            <View className="w-fit border-l h-14 border-base-content-2/20 items-center justify-center p-2">
              <ThemedText className="text-xl font-grotes-bold">Rs. {Number(currentAmount || 0).toLocaleString("en-PK")}</ThemedText>
            </View>
          </View>
          {/* Keypad */}
          {[
            ["1", "2", "3"],
            ["4", "5", "6"],
            ["7", "8", "9"],
            ["C", "0", "+"],
          ].map((row, rowIndex) => (
            <View key={rowIndex} className={`flex-row ${rowIndex < 3 ? "border-b border-base-content-2/20" : ""}`}>
              {row.map((key, keyIndex) => (
                <TouchableOpacity
                  key={key}
                  onPress={() => {
                    if (key === "+") handleAddCharge();
                    else handleKeyPress(key);
                  }}
                  className={`flex-1 h-16 items-center justify-center ${
                    keyIndex < row.length - 1 ? "border-r border-base-content-2/20" : ""
                  } ${key === "+" ? "bg-primary" : "bg-base-200"} ${key === "C" && "!bg-base-content/20"}`}
                >
                  <ThemedText className={`text-xl font-grotes-bold ${key === "+" ? "text-primary-content" : "text-base-content"} `}>
                    {key}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </View>
          ))}
        </View>

        {/* Quick Charge Button */}
        {charges.length > 0 && (
          <PrimaryButton
            title={`Quick Charge (${charges.length} item${charges.length > 1 ? "s" : ""})`}
            onPress={() => console.log("Quick Charge / Print Receipt")}
            className="mt-4"
          />
        )}
      </View>
    </View>
  );
}
