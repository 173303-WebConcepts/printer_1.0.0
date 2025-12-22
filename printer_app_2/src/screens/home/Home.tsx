import React, { useState } from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { ThemedText } from "../../widgets/ThemeText";
import CustomTextInput from "../../widgets/CustomTextInput";
import { PrimaryButton } from "../../widgets/Button";
import AppIcon from "../../components/AppIcon";
import Svg, { Defs, Path, RadialGradient, Rect, Stop } from "react-native-svg";
import LinearGradient from "react-native-linear-gradient";

export default function HomeScreen() {
  return <ThemedText className="mb-6 text-center text-base-content-2">Welcome Hamza Hmeed</ThemedText>;
}
