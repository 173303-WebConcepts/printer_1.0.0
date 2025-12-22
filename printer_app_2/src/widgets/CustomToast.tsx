import React from "react";
import Toast, { BaseToast, ErrorToast, ToastShowParams } from "react-native-toast-message";
import { Text, useColorScheme, View } from "react-native";
import Ionicons from "@react-native-vector-icons/ionicons";
import { VStack } from "@/components/ui/vstack";
import { Progress, ProgressFilledTrack } from "@/components/ui/progress";
import { ThemedText } from "./ThemeText";
const primaryColor = "#00D390";

const baseToastStyle = {
  borderLeftWidth: 6,
  borderRadius: 10,
  paddingHorizontal: 12,
  paddingVertical: 10,
  elevation: 5,
};

const getThemeColors = (isDark: boolean) => ({
  backgroundColor: isDark ? "#232526" : "#FFF3E9",
  textColor: isDark ? "rgba(236, 249, 255, 0.7)" : "#2D2D2D",
});

export const useToastConfig = () => {
  const isDark = useColorScheme() === "dark";
  const theme = getThemeColors(isDark);

  const renderIcon = (name: string, color: string) => (
    <View style={{ marginRight: 0 }}>
      <Ionicons name={name as any} size={22} color={color} />
    </View>
  );

  const toastConfig = {
    success: (props: any) => (
      <View className="mx-3 w-[90%] rounded-xl border-l-4 border border-success bg-base-200 p-3 shadow-lg">
        <View className="flex-row items-start gap-2">
          <Ionicons name="checkmark-circle" size={22} color="#00D390" />

          <View className="flex-1">
            {/* Title */}
            <ThemedText className="text-[17px] font-grotesk-semiBold text-base-content-70 mb-1">{props.text1}</ThemedText>

            {/* 🔥 Description – NO LINE LIMIT */}
            {props.text2 && <ThemedText className="text-[15px] text-base-content-70/80 leading-5 flex-wrap">{props.text2}</ThemedText>}
          </View>
        </View>
      </View>
    ),

    error: (props: any) => (
      <View className="mx-3 w-[90%] rounded-xl border-l-4 border border-error bg-base-200 p-3 shadow-lg">
        <View className="flex-row items-start gap-2">
          <Ionicons name="close-circle" size={22} color="#FF637D" />

          <View className="flex-1">
            {/* Title */}
            <ThemedText className="text-[17px] font-grotesk-semiBold text-base-content-70 mb-1">{props.text1}</ThemedText>

            {/* 🔥 Description – NO LINE LIMIT */}
            {props.text2 && <ThemedText className="text-[15px] text-base-content-70/80 leading-5 flex-wrap">{props.text2}</ThemedText>}
          </View>
        </View>
      </View>
    ),

    warn: (props: any) => (
      <View className="mx-3 w-[90%] rounded-xl border-l-4 border border-[#FACC15] bg-base-200 p-3 shadow-lg">
        <View className="flex-row items-start gap-2">
          <Ionicons name="warning" size={22} color="#FACC15" />

          <View className="flex-1">
            {/* Title */}
            <ThemedText className="text-[17px] font-grotesk-semiBold text-base-content-70 mb-1">{props.text1}</ThemedText>

            {/* 🔥 Description – NO LINE LIMIT */}
            {props.text2 && <ThemedText className="text-[15px] text-base-content-70/80 leading-5 flex-wrap">{props.text2}</ThemedText>}
          </View>
        </View>
      </View>
    ),

    progress: (props: any) => {
      const percent = props.props?.percent ?? 0;

      const displayPercent = props.props?.title === "Uploading Backup" ? Math.round(percent / 2) : percent;

      return (
        <View
          pointerEvents="none" // prevent swipe dismiss
          onStartShouldSetResponder={() => true} // block all touches
          style={{
            backgroundColor: theme.backgroundColor,
            borderRadius: 10,
            padding: 12,
            marginHorizontal: 10,
            borderLeftWidth: 6,
            width: "90%",
            borderLeftColor: primaryColor,
            elevation: 9999999, // Android
            zIndex: 9999999, // iOS
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Ionicons name="cloud-upload" size={22} color={primaryColor} style={{ marginRight: 8 }} />
            <ThemedText className="text-lg font-grotesk-semiBold">
              {props?.props?.title} {displayPercent}%
            </ThemedText>
          </View>

          <VStack space="lg" className="max-w-100 w-full mt-3">
            <Progress value={displayPercent} className="w-full h-3">
              <ProgressFilledTrack className="h-3 bg-success" />
            </Progress>
          </VStack>
        </View>
      );
    },
  };

  return toastConfig;
};

const showToast = (params: ToastShowParams) => Toast.show(params);

const defaultOptions: Partial<ToastShowParams> = {
  position: "top",
  visibilityTime: 4000,
  autoHide: true,
  topOffset: 20,
};

const AppToast = {
  success: (message: string, description?: string) => showToast({ type: "success", text1: message, text2: description, ...defaultOptions }),
  error: (message: string, description?: string, options?: Partial<ToastShowParams>) =>
    showToast({
      type: "error",
      text1: message,
      text2: description,
      ...defaultOptions,
      ...options,
    }),
  warn: (message: string, description?: string) => showToast({ type: "warn", text1: message, text2: description, ...defaultOptions }),
  progress: (percent: number, title?: string) =>
    Toast.show({
      type: "progress",
      props: { percent, title },
      position: "top",
      autoHide: false, // NEVER auto-hide a progress bar
      topOffset: 20,
    }),
};

export { Toast };
export default AppToast;
