import React from "react";
import { Text, TextProps } from "react-native";

export function ThemedText({ className, ...props }: TextProps & { className?: string }) {
  return <Text className={`text-base-content-70 font-grotes ${className}`} {...props} />;
}
