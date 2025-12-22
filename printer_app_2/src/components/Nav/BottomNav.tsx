// src/navigation/BottomTabs.tsx
import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { View } from "react-native";
import { ThemedText } from "../../widgets/ThemeText";

// Screens
import DashboardScreen from "../../screens/dashboard/Dashboard";
import ProductList from "../../screens/dashboard/product/list";
import AddProduct from "../../screens/dashboard/product/add";
import CounterScreen from "../../screens/counter";
import OtpScreen from "../../screens/auth/OTP";

import Ionicons from "@react-native-vector-icons/ionicons";
import CategoryList from "@/src/screens/dashboard/category/list";
import AddCategory from "@/src/screens/dashboard/category/add";
import Settings from "@/src/screens/dashboard/settings";
import ChangePIN from "@/src/screens/auth/ChangePIN";
import TransactionList from "@/src/screens/dashboard/transaction/list";
import TransactionDetails from "@/src/screens/dashboard/transaction/details";

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// --- Stack for dashboard-related screens ---
function DashboardStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Dashboard" component={DashboardScreen} />
      <Stack.Screen name="Product List" component={ProductList} />
      <Stack.Screen name="Add Product" component={AddProduct} />
      <Stack.Screen name="Edit Product" component={AddProduct} />
      <Stack.Screen name="Category List" component={CategoryList} />
      <Stack.Screen name="Add Category" component={AddCategory} />
      <Stack.Screen name="Change PIN" component={ChangePIN} />
      <Stack.Screen name="Bill List" component={TransactionList} />
      <Stack.Screen name="Bills Details" component={TransactionDetails} />
    </Stack.Navigator>
  );
}

export default function BottomTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          elevation: 5,
          backgroundColor: "#232526",
          height: 70,
          borderTopWidth: 1,
          borderTopColor: "rgba(236, 249, 255, 0.2)",
        },
      }}
    >
      {/* Dashboard Tab */}
      <Tab.Screen
        name="Dashboard"
        component={DashboardStack}
        options={{
          tabBarIcon: ({ focused }) => (
            <View className="flex-1 justify-center items-center !min-h-[70px] w-[80px] mt-8">
              <Ionicons name="grid-outline" size={26} color={focused ? "#FD680D" : "#9CA3AF"} />
              <ThemedText
                style={{
                  fontSize: 12,
                  marginTop: 2,
                  color: focused ? "#FD680D" : "#9CA3AF",
                }}
              >
                Dashboard
              </ThemedText>
            </View>
          ),
        }}
      />

      {/* Counter Tab */}
      <Tab.Screen
        name="Counter"
        component={CounterScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <View className="flex-1 justify-center items-center !min-h-[70px] w-[80px] mt-8">
              <Ionicons name="wallet-outline" size={26} color={focused ? "#FD680D" : "#9CA3AF"} />
              <ThemedText
                style={{
                  fontSize: 12,
                  marginTop: 2,
                  color: focused ? "#FD680D" : "#9CA3AF",
                }}
              >
                Cashier
              </ThemedText>
            </View>
          ),
        }}
      />

      {/* Settings Tab */}
      <Tab.Screen
        name="Settings"
        component={Settings}
        options={{
          tabBarIcon: ({ focused }) => (
            <View className="flex-1 justify-center items-center !min-h-[70px] w-[80px] mt-8">
              <Ionicons name="settings-outline" size={26} color={focused ? "#FD680D" : "#9CA3AF"} />
              <ThemedText
                style={{
                  fontSize: 12,
                  marginTop: 2,
                  color: focused ? "#FD680D" : "#9CA3AF",
                }}
              >
                Settings
              </ThemedText>
            </View>
          ),
        }}
      />
    </Tab.Navigator>
  );
}
