import React, { useState } from "react";
import { View, FlatList, TouchableOpacity, Image, Text, Dimensions } from "react-native";
import TopBottomNav from "../../../layouts/TopBottomNav";
import { ThemedText } from "../../../widgets/ThemeText";
import Ionicons from "@react-native-vector-icons/ionicons";
import { PrimaryButton } from "../../../widgets/Button";
import AppIcon from "../../../components/AppIcon";
import CustomTextInput from "../../../widgets/CustomTextInput";

const screenWidth = Dimensions.get("window").width;
const ITEM_MARGIN = 8;
const numColumns = 3;
const ITEM_WIDTH = (screenWidth - ITEM_MARGIN * (numColumns + 1) - 16) / numColumns;

type Product = {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
};

const sampleProducts: Product[] = [
  {
    id: "1",
    name: "Burger",
    price: 1200,
    image: "https://img.icons8.com/color/200/000000/hamburger.png",
    quantity: 0,
  },
  {
    id: "2",
    name: "Pizza",
    price: 800,
    image: "https://img.icons8.com/color/200/000000/pizza.png",
    quantity: 0,
  },
  {
    id: "3",
    name: "French Fries",
    price: 1500,
    image: "https://img.icons8.com/color/200/000000/french-fries.png",
    quantity: 0,
  },
  {
    id: "5",
    name: "Sushi",
    price: 2000,
    image: "https://img.icons8.com/color/200/000000/sushi.png",
    quantity: 0,
  },
  {
    id: "6",
    name: "Ice Cream",
    price: 1100,
    image: "https://img.icons8.com/color/200/000000/ice-cream-cone.png",
    quantity: 0,
  },
  {
    id: "7",
    name: "Donut",
    price: 700,
    image: "https://img.icons8.com/color/200/000000/donut.png",
    quantity: 0,
  },
  {
    id: "8",
    name: "Taco",
    price: 950,
    image: "https://img.icons8.com/color/200/000000/taco.png",
    quantity: 0,
  },
  {
    id: "9",
    name: "Sandwich",
    price: 850,
    image: "https://img.icons8.com/color/200/000000/sandwich.png",
    quantity: 0,
  },
  {
    id: "10",
    name: "Cake",
    price: 1200,
    image: "https://img.icons8.com/color/200/000000/cake.png",
    quantity: 0,
  },
  {
    id: "11",
    name: "Pancakes",
    price: 1050,
    image: "https://img.icons8.com/color/200/000000/pancakes.png",
    quantity: 0,
  },
  {
    id: "12",
    name: "Coffee",
    price: 500,
    image: "https://img.icons8.com/color/200/000000/coffee.png",
    quantity: 0,
  },
];

export default function FavouriteItemsScreen() {
  const [products, setProducts] = useState<Product[]>(sampleProducts);
  const [searchText, setSearchText] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [selectedBrand, setSelectedBrand] = useState("All Brands");

  const categories = ["All Categories", "Burgers", "Pizza", "Desserts"];
  const brands = ["All Brands", "Brand A", "Brand B", "Brand C"];

  const incrementQuantity = (id: string) => {
    setProducts(prev => prev.map(p => (p.id === id ? { ...p, quantity: p.quantity + 1 } : p)));
  };

  const decrementQuantity = (id: string) => {
    setProducts(prev => prev.map(p => (p.id === id ? { ...p, quantity: Math.max(0, p.quantity - 1) } : p)));
  };

  const totalItems = products.reduce((sum, p) => sum + p.quantity, 0);

  const renderItem = ({ item }: { item: Product }) => (
    <TouchableOpacity
      onPress={() => incrementQuantity(item.id)} // Increment when whole card is pressed
      activeOpacity={0.8}
      style={{
        width: ITEM_WIDTH,
        borderRadius: 8,
      }}
      className={`bg-base-200 ${item.quantity > 0 ? "border border-primary" : ""}`}
    >
      {/* Image Container */}
      <View className="relative items-center">
        <Image
          source={{ uri: item.image }}
          style={{
            width: ITEM_WIDTH - 16,
            height: ITEM_WIDTH - 16,
            borderRadius: 8,
          }}
          resizeMode="cover"
        />
        {/* Quantity Badge */}
        {item.quantity > 0 && (
          <View className="absolute top-1 right-1 bg-primary w-6 h-6 rounded-full items-center justify-center">
            <Text className="text-primary-content text-xs font-grotes-bold">{item.quantity}</Text>
          </View>
        )}
      </View>

      {/* Product Name */}
      <ThemedText className={`mt-2 text-center ${item.quantity > 0 ? "text-primary" : ""}`}>{item.name}</ThemedText>

      {/* Product Price */}
      <ThemedText className={`text-base text-center font-grotes-bold mt-1 ${item.quantity > 0 ? "text-primary" : ""}`}>
        Rs. {item.price.toLocaleString("en-PK")}
      </ThemedText>

      {/* Quantity Controls */}
      <View className="flex-row justify-between mt-2 border-t border-base-content-20">
        <TouchableOpacity
          onPress={e => {
            e.stopPropagation(); // Prevent the parent TouchableOpacity increment
            decrementQuantity(item.id);
          }}
          className="bg-base-200 p-2 rounded-l-lg"
        >
          <AppIcon IconComponent={Ionicons} name="remove" size={18} className="text-base-content-70" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={e => {
            e.stopPropagation(); // Optional: prevent double increment if using add button separately
            incrementQuantity(item.id);
          }}
          className="bg-base-200 p-2 rounded-r-lg"
        >
          <AppIcon IconComponent={Ionicons} name="add" size={18} className="text-base-content-70" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 py-4 bg-base-100">
      {/* Search Bar */}
      <View className="mb-4">
        <CustomTextInput placeholder="Search item..." value={searchText} onChangeText={setSearchText} icon="search" />
      </View>

      <FlatList
        data={products}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        numColumns={numColumns}
        contentContainerStyle={{ paddingBottom: 50, paddingHorizontal: 1 }}
        columnWrapperStyle={{
          justifyContent: "space-between",
          marginBottom: 12,
        }}
      />

      {/* Quick Charge Button */}
      {totalItems > 0 && (
        <PrimaryButton
          title={`Quick Charge (${totalItems} item${totalItems > 1 ? "'s" : ""})`}
          onPress={() => console.log("Quick Charge pressed")}
          className="absolute bottom-3 w-full"
        />
      )}
    </View>
  );
}
