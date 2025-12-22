import React, { useState } from "react";
import { View, TextInput, Text, TouchableOpacity, FlatList } from "react-native";
import { FormControl } from "@/components/ui/form-control";
import Ionicons from "@react-native-vector-icons/ionicons";
import { Input, InputField, InputIcon, InputSlot } from "@/components/ui/input";
import AppIcon from "../components/AppIcon";
import { ThemedText } from "./ThemeText";

interface MultiTextInputProps {
  label?: string;
  value: string[];
  onChange: (val: string[]) => void;
  placeholder?: string;
  error?: string;
}

const CustomMultiTextInput: React.FC<MultiTextInputProps> = ({ label, value, onChange, placeholder, error }) => {
  const [text, setText] = useState("");

  const handleAdd = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    if (value.includes(trimmed)) return; // avoid duplicates
    onChange([...value, trimmed]);
    setText("");
  };

  const handleRemove = (index: number) => {
    const updated = [...value];
    updated.splice(index, 1);
    onChange(updated);
  };

  return (
    <FormControl>
      {label && <ThemedText className="text-base font-medium mb-2">{label}</ThemedText>}

      {/* Input with Plus Icon */}
      <View className="relative w-full flex flex-row items-center gap-1">
        {/* Input without border, fills remaining width */}
        <Input
          className={`bg-base-200  pl-3 pr-10 flex-1 ${error ? "border-error data-[hover=true]:border-error data-[focus=true]:border-error data-[focus=true]:hover:border-error" : "border-0"}`}
          size={"lg"}
        >
          <AppIcon name="layers-outline" size={20} />

          <InputField
            value={text}
            onChangeText={setText}
            placeholder={placeholder || "Enter category name"}
            placeholderTextColor="rgba(236, 249, 255, 0.7)"
            onSubmitEditing={handleAdd}
            blurOnSubmit={false}
            className="text-base text-base-content-70"
          />
        </Input>

        {/* Overlapping Icon on right side */}
        <TouchableOpacity onPress={handleAdd} className="">
          <Ionicons name="add-circle-outline" size={26} color="#00BAFE" />
        </TouchableOpacity>
      </View>

      {/* Category List */}
      {value.length > 0 && (
        <View className="mt-3 space-y-2">
          {value.map((item, index) => (
            <View key={index} className="flex-row justify-between items-center bg-base-200 border-b px-3 py-2">
              <ThemedText className="text-primary capitalize">{item}</ThemedText>
              <TouchableOpacity onPress={() => handleRemove(index)}>
                <AppIcon name="trash-outline" size={22} className="text-error" />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      {error ? <Text className="text-error mt-1">{error}</Text> : null}
    </FormControl>
  );
};

export default CustomMultiTextInput;
