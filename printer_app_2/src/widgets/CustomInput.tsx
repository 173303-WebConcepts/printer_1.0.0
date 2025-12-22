import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import Ionicons from "@react-native-vector-icons/ionicons";
import AppIcon from "../components/AppIcon";
import { Input, InputField, InputSlot } from "@/components/ui/input";
import { getIn } from "formik";
import { FormControlError, FormControlErrorIcon, FormControlErrorText } from "@/components/ui/form-control";
import { AlertCircleIcon } from "@/components/ui/icon";

export default function CustomInput({
  label,
  icon,
  value,
  onChangeText,
  placeholder,
  IconComponent,
  className = "",
  field,
  form,
  error,
  keyboardType = "default", // ✅ default keyboard
  onFocus,
  ...rest
}: any) {
  return (
    <>
      {label && <Text className="mb-1 text-sm text-base-content-70">{label}</Text>}

      <Input variant="outline" size="xl" className={`bg-base-200 ${error ? "border-error" : "border-base-200"} ${className}`} {...rest}>
        {icon && (
          <InputSlot className="pl-3">
            <AppIcon IconComponent={IconComponent ?? Ionicons} name={icon} size={20} className="text-base-content-70" />
          </InputSlot>
        )}

        {/* INPUT FIELD */}
        {value ? (
          <InputField
            placeholder={placeholder}
            value={value?.toString() ?? ""}
            onChangeText={onChangeText}
            keyboardType={keyboardType} // ✅ works now
            onFocus={onFocus}
          />
        ) : (
          <InputField
            placeholder={placeholder}
            onChangeText={onChangeText}
            keyboardType={keyboardType} // ✅ works now
            onFocus={onFocus}
          />
        )}

        {/* CLEAR ICON */}
        {value !== "" && value !== null && value !== undefined && (
          <InputSlot className="pr-3">
            <TouchableOpacity onPress={() => onChangeText("")}>
              <AppIcon IconComponent={Ionicons} name="close-circle" size={20} className="text-base-content-70" />
            </TouchableOpacity>
          </InputSlot>
        )}
      </Input>

      {error && (
        <View className="flex-row items-center gap-1 mt-1">
          <FormControlErrorIcon as={AlertCircleIcon} className="text-error" size={"sm"} />
          <Text className="text-error text-sm font-grotes">{error}</Text>
        </View>
      )}
    </>
  );
}
