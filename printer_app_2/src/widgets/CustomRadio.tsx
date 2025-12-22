import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import {
  Radio,
  RadioGroup,
  RadioIndicator,
  RadioIcon,
  RadioLabel,
} from "@/components/ui/radio";
import { FormControlErrorIcon } from "@/components/ui/form-control";
import { AlertCircleIcon, CircleIcon } from "@/components/ui/icon";

interface Option {
  label: string;
  value: string | boolean;
}

interface CustomRadioGroupProps {
  label?: string;
  options: Option[];
  value: string | boolean;
  onChange: (val: string | boolean) => void;
  error?: string;
  disabled?: boolean;
  direction?: "row" | "column";
}

const CustomRadioGroup: React.FC<CustomRadioGroupProps> = ({
  label,
  options,
  value,
  onChange,
  error,
  disabled = false,
  direction = "row",
}) => {
  // Convert value to string for the RadioGroup
  const selectedValue = value?.toString();

  // Handler to convert string back to correct type
  const handleSelect = (val: string) => {
    if (val === "true") onChange(true);
    else if (val === "false") onChange(false);
    else onChange(val);
  };

  return (
    <View className="w-full">
      {label && (
        <Text className="mb-1 text-sm text-base-content-70">{label}</Text>
      )}

      <RadioGroup
        value={selectedValue}
        onChange={handleSelect}
        isDisabled={disabled}
        className={`flex ${
          direction === "row"
            ? "flex-row flex-wrap gap-8"
            : "flex-col gap-3"
        }`}
      >
        {options.map((option, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => handleSelect(option.value.toString())}
            disabled={disabled}
            activeOpacity={0.8}
          >
            <Radio
              value={option.value.toString()}
              isInvalid={!!error}
              isDisabled={disabled}
              size="md"
              className="flex-row items-center"
            >
              <RadioIndicator>
                <RadioIcon as={CircleIcon} />
              </RadioIndicator>
              <RadioLabel className=" text-base-content-70">
                {option.label}
              </RadioLabel>
            </Radio>
          </TouchableOpacity>
        ))}
      </RadioGroup>

      {error && (
        <View className="flex-row items-center gap-1 mt-1">
          <FormControlErrorIcon
            as={AlertCircleIcon}
            className="text-error"
            size={"sm"}
          />
          <Text className="text-error text-sm font-grotes">{error}</Text>
        </View>
      )}
    </View>
  );
};

export default CustomRadioGroup;
