import React, { useState } from "react";
import {
  Select,
  SelectTrigger,
  SelectInput,
  SelectIcon,
  SelectPortal,
  SelectBackdrop,
  SelectContent,
  SelectDragIndicatorWrapper,
  SelectDragIndicator,
  SelectItem,
  SelectScrollView,
} from "@/components/ui/select";
import { AlertCircleIcon, ChevronDownIcon } from "@/components/ui/icon";
import AppIcon from "../components/AppIcon";
import Ionicons from "@react-native-vector-icons/ionicons";
import { Text, View, TouchableOpacity } from "react-native";
import { FormControlErrorIcon } from "@/components/ui/form-control";
import { ThemedText } from "./ThemeText";
import { PrimaryButton } from "./Button";
import { useNavigation } from "@react-navigation/native";

const CustomSelect = ({
  label,
  items = [],
  placeholder = "Select option",
  icon,
  IconComponent,
  error,
  value: externalValue,
  onSelect,
  navigationLink,
}: any) => {
  const navigation = useNavigation<any>();

  const handleSelect = (val: string) => {

    const findedValue = items.find((item: any) => item.value === val);

    if (findedValue?.value) {
      onSelect(findedValue);
    } else {
      onSelect({ label: val, value: val });
    }
  };

  const clearSelection = () => {
    onSelect(""); // this clears Formik's field
  };

  // const findedValue = items.find((item: any) => item.value === externalValue);

  return (
    <>
      {label && <Text className="mb-1 text-sm text-base-content-70">{label}</Text>}

      <Select key={externalValue || "empty"} selectedValue={externalValue?.label} onValueChange={handleSelect}>
        <SelectTrigger size="xl" className={`justify-between bg-base-200  relative ${error ? "border-error" : "border-base-200"}`}>
          {/* Left icon (optional) */}
          <View className="flex flex-row">
            {icon && (
              <View className="flex-row items-center pl-3">
                <AppIcon IconComponent={IconComponent ?? Ionicons} name={icon} size={20} className="text-base-content-70" />
              </View>
            )}

            {/* Selected value / placeholder */}
            <SelectInput placeholder={placeholder} />
          </View>

          {/* Clear Icon (only when a value is selected) */}
          {externalValue ? (
            <TouchableOpacity onPress={clearSelection} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} className="absolute right-12">
              <AppIcon IconComponent={Ionicons} name="close-circle" size={18} className="text-base-content-70" />
            </TouchableOpacity>
          ) : null}

          {/* Dropdown Icon */}
          <SelectIcon className="mr-3 text-base-content-70" as={ChevronDownIcon} />
        </SelectTrigger>

        {/* Dropdown list */}
        <SelectPortal>
          <SelectBackdrop />
          <SelectContent className="bg-base-200 border border-base-content-20 rounded-lg" style={{ maxHeight: 300 }}>
            <SelectDragIndicatorWrapper>
              <SelectDragIndicator />
            </SelectDragIndicatorWrapper>

            {items && items.length > 0 ? (
              <SelectScrollView>
                {items.map((item: any, index: number) => (
                  <SelectItem label={item.label} value={item.value ? item.value : item.label} key={index} />
                ))}
              </SelectScrollView>
            ) : (
              <View className="py-5 items-center">
                <ThemedText>{placeholder} doesn't exist</ThemedText>
                <PrimaryButton title="Add New" className="mt-5" onPress={() => navigation.navigate(navigationLink)} />
              </View>
            )}
          </SelectContent>
        </SelectPortal>

        {/* Error Message */}
        {error && (
          <View className="flex-row items-center gap-1 mt-1">
            <FormControlErrorIcon as={AlertCircleIcon} className="text-error" size={"sm"} />
            <Text className="text-error text-sm font-grotes">{error}</Text>
          </View>
        )}
      </Select>
    </>
  );
};

export default CustomSelect;
