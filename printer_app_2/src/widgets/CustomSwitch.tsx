import React from "react";
import { HStack } from "@/components/ui/hstack";
import { Switch } from "@/components/ui/switch";
import { ThemedText } from "./ThemeText";

type CustomSwitchProps = {
  label?: string;
  value: boolean; // controlled value
  onToggle: (value: boolean) => void; // called when switch is toggled
  disabled?: boolean;
};

const CustomSwitch: React.FC<CustomSwitchProps> = ({ label = "Allow notifications", value, onToggle, disabled = false }) => {
  return (
    <HStack space="md" opacity={disabled ? 0.5 : 1} className="flex-row items-center">
      <Switch
        value={value}
        onToggle={() => onToggle(!value)}
        isDisabled={disabled}
        trackColor={{ false: "#d4d4d4", true: "#FD680D" }}
        thumbColor="#fafafa"
        activeThumbColor="#fafafa"
        ios_backgroundColor="#d4d4d4"
      />
      <ThemedText>{label}</ThemedText>
    </HStack>
  );
};

export default CustomSwitch;
