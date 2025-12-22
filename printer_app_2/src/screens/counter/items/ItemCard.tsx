import AppIcon from "@/src/components/AppIcon";
import RealmImage from "@/src/widgets/RealmImage";
import { ThemedText } from "@/src/widgets/ThemeText";
import Ionicons from "@react-native-vector-icons/ionicons";
import React from "react";
import { TouchableOpacity, View } from "react-native";

const ItemCard = React.memo(
  ({ item, onInc, onDec, onReset, isLastInRow }: any) => {
    return (
      <TouchableOpacity
        onPress={() => onInc(item.localId)}
        activeOpacity={0.8}     
        className={`bg-base-200 ${isLastInRow ? "mr-[0px]" : "mr-[10px]"} flex-col flex-1 justify-between rounded-lg ${item.quantity > 0 ? "border border-primary" : ""}`}
      >
        {/* Image Container */}
        <View className="relative items-center">
          <RealmImage binary={item.image?.binary} mimeType={item.image?.mimeType} className="rounded-t-[8px] w-full h-[80px]" />

          {/* Quantity Badge */}
          {item.quantity > 0 && (
            <View className="absolute top-1 right-1 bg-primary w-6 h-6 rounded-full items-center justify-center">
              <ThemedText className="text-primary-content text-xs font-grotes-bold">{item.quantity}</ThemedText>
            </View>
          )}
        </View>

        <View>
          {/* Product Name */}
          <ThemedText
            className={`mt-2 text-center capitalize
          ${item.quantity > 0 ? "text-primary" : ""}
         `}
          >
            {item.name}
          </ThemedText>

          {/* Product Price */}
          <ThemedText
            className={`text-base text-center font-grotes-bold mt-1
          ${item.quantity > 0 ? "text-primary" : ""}
         `}
          >
            Rs. {item.sellingPrice.toLocaleString("en-PK")}
          </ThemedText>
        </View>

        {/* Quantity Controls */}
        <View className="flex-row justify-between items-center mt-2 border-t border-base-content-20">
          <TouchableOpacity
            onPress={e => {
              e.stopPropagation(); // Prevent the parent TouchableOpacity increment
              onDec(item.localId);
            }}
            className="bg-base-200 p-2 rounded-l-lg"
          >
            <AppIcon IconComponent={Ionicons} name="remove" size={18} className="text-base-content-70" />
          </TouchableOpacity>

          {item.quantity > 0 && (
            <TouchableOpacity
              onPress={e => {
                e.stopPropagation(); // prevent item click (increment)
                onReset(item.localId);
              }}
              className="p-2"
            >
              <AppIcon IconComponent={Ionicons} name="trash" size={18} className="text-error" />
            </TouchableOpacity>
          )}

          <TouchableOpacity
            onPress={e => {
              e.stopPropagation(); // Optional: prevent double increment if using add button separately
              onInc(item.localId);
            }}
            className="bg-base-200 p-2 rounded-r-lg"
          >
            <AppIcon IconComponent={Ionicons} name="add" size={18} className="text-base-content-70" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  },
  (prev, next) =>
    prev.item.quantity === next.item.quantity && prev.item.name === next.item.name && prev.item.sellingPrice === next.item.sellingPrice,
);

export default ItemCard;
