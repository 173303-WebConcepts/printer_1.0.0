import { Spinner } from "@/components/ui/spinner";
import { setGAuth, setUser } from "@/src/redux/slices/userSlice";
import { axiosInstance } from "@/src/utils/axios";
import { Helper } from "@/src/utils/Helper";
import { Backup } from "@/src/utils/helpers/backup";
import AppToast from "@/src/widgets/CustomToast";
import { ThemedText } from "@/src/widgets/ThemeText";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { GDrive } from "@robinbobin/react-native-google-drive-api-wrapper";
import { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import LinearGradient from "react-native-linear-gradient";
import Svg, { Path } from "react-native-svg";
import { useDispatch, useSelector } from "react-redux";

export default function BackupSettingsScreen() {
  const [isLoading, setIsLoading] = useState(false);

  const { user } = useSelector((state: any) => state.user);
  const navigation = useNavigation();
  const dispatch = useDispatch();

  async function handleEnableBackup() {
    try {
      setIsLoading(true);
      const isOnline = await Helper.checkInternet();
      if (!isOnline) return;

      const googleUser = await Backup.connectGoogleDrive();

      if (googleUser?.email) {
        const form_data: any = {
          ...(!user?.email && { email: googleUser.email }),
        };

        if (user && !user?.email) {
          await AsyncStorage.setItem("lastBackupAt", Date.now().toString());
        }

        const expiresAt = Date.now() + googleUser.expiresIn * 1000;

        dispatch(
          setUser({
            user: {
              ...user,
              ...form_data,
            },
          }),
        );
        dispatch(
          setGAuth({
            accessToken: googleUser.accessToken,
            expiresAt: expiresAt,
          }),
        );

        AppToast.success("Success", "Cloud Backup Enabled");
        navigation.navigate("Dashboard");
      }
    } catch (e) {
      console.log("Error as JSON:", JSON.stringify(e));
      AppToast.error("Oops!!", "Error Occur");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <View className="flex-1 justify-center">
      <LinearGradient
        colors={["rgba(253, 104, 13, 0.2)", "rgba(253, 104, 13, 0.1)", "rgba(15, 17, 18, 0.5)"]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 0.5 }}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "50%",
        }}
      />

      <View className="px-[10px]">
        <ThemedText className="text-3xl font-grotes-bold mb-1 text-center">Enable Cloud Backup</ThemedText>

        <ThemedText className="mb-10 text-center text-base-content-2">Sign in with Google to securely backup your POS data</ThemedText>

        <TouchableOpacity
          onPress={handleEnableBackup}
          className={`flex-row items-center rounded-md border px-4 py-3 ${isLoading ? "bg-white/70" : "bg-white"}`}
          disabled={isLoading}
        >
          <Svg width={20} height={20} viewBox="0 0 533.5 544.3" className="mr-2">
            <Path
              d="M533.5 278.4c0-17.6-1.6-35.2-4.8-52.1H272v98.7h147.1c-6.3 33.9-25.5 62.8-54.4 82v68h87.8c51.3-47.3 81-116.9 81-196.6z"
              fill="#4285F4"
            />
            <Path
              d="M272 544.3c73.8 0 135.8-24.5 181-66.5l-87.8-68c-24.4 16.3-55.5 26-93.2 26-71.6 0-132.4-48.3-154.1-113.2H28.3v70.7C73 479.2 167.3 544.3 272 544.3z"
              fill="#34A853"
            />
            <Path
              d="M117.9 323.3c-5.3-15.8-8.3-32.5-8.3-49.7s3-33.9 8.3-49.7V153.2H28.3c-17.6 35.1-28 74.6-28 118.7s10.4 83.6 28 118.7l89.6-67.3z"
              fill="#FBBC05"
            />
            <Path
              d="M272 107.3c39.8-.6 75.1 13.6 103.2 39.5l77.2-77.2C407.4 24.5 345.4 0 272 0 167.3 0 73 65.1 28.3 153.2l89.6 70.7C139.6 155.6 200.4 107.3 272 107.3z"
              fill="#EA4335"
            />
          </Svg>

          <Text className="text-lg ml-2 mr-2">Sign in with Google</Text>
          {isLoading && <Spinner color={"black"} />}
        </TouchableOpacity>
      </View>
    </View>
  );
}
