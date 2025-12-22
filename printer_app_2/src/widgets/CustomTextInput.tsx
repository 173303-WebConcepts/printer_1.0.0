import React from "react";
import { TextInput, TextInputProps, View, Text, TouchableOpacity } from "react-native";
import Ionicons from "@react-native-vector-icons/ionicons";
import AppIcon from "../components/AppIcon";

type CustomTextInputProps = TextInputProps & {
  label?: string; // Optional label
  error?: string; // Optional error text
  icon?: string; // Leading icon (Ionicons name)
  value: string; // Controlled value
  IconComponent?: any; // Controlled value
  onChangeText: (text: string) => void;
  className?: string;
};

export default function CustomTextInput({
  label,
  error,
  icon,
  value,
  onChangeText,
  placeholder,
  IconComponent,
  className = "",
  ...rest
}: CustomTextInputProps) {
  return (
    <View className="w-full">
      {/* Label */}
      {/* {label && (
        <Text className="mb-1 text-sm text-base-content-70">{label}</Text>
      )} */}

      {/* Input Container */}
      <View className="flex-row items-center bg-base-200 rounded-lg px-4 py-1.5">
        {/* Leading Icon */}
        {icon && (
          <AppIcon IconComponent={IconComponent ? IconComponent : Ionicons} name={icon} size={20} className="text-base-content-70" />
        )}

        {/* Input */}
        <TextInput
          className={`flex-1 ml-2 text-base text-base-content-70 ${className}`}
          placeholder={placeholder}
          placeholderTextColor="rgba(236, 249, 255, 0.7)"
          value={value}
          onChangeText={onChangeText}
          {...rest}
        />

        {/* Cancel / Clear Icon */}
        {value.length > 0 && (
          <TouchableOpacity onPress={() => onChangeText("")} className="ml-2">
            <AppIcon IconComponent={Ionicons} name="close-circle" size={22} className="text-base-content-70" />
          </TouchableOpacity>
        )}
      </View>

      {/* Error Message */}
      {error && <Text className="mt-1 text-sm text-error">{error}</Text>}
    </View>
  );
}
