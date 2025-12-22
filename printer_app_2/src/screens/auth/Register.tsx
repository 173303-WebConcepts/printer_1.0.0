import React, { useState } from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { ThemedText } from "../../widgets/ThemeText";
import CustomTextInput from "../../widgets/CustomTextInput";
import { PrimaryButton } from "../../widgets/Button";
import Fontisto from "@react-native-vector-icons/fontisto";
import Feather from "@react-native-vector-icons/feather";
import AppIcon from "../../components/AppIcon";
import Svg, { Defs, Path, RadialGradient, Rect, Stop } from "react-native-svg";
import LinearGradient from "react-native-linear-gradient";
import { useNavigation } from "@react-navigation/native";

export default function RegisterScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigation = useNavigation<any>();

  const isFormValid = email.trim().length > 0 && password.trim().length > 0;

  const handleLogin = () => {

  };

  const handleGoogleLogin = () => {

  };

  const handleFacebookLogin = () => {

  };

  return (
    <View className="flex-1 justify-center">
      {/* Gradient background */}
      <LinearGradient
        colors={["rgba(253, 104, 13, 0.2)", "rgba(253, 104, 13, 0.1)", "rgba(15, 17, 18, 0.5)"]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 0.5 }} // gradient stops at half the screen
        // locations={[0.2, 0.3, 0.9]}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "50%",
        }}
      />

      <View className="px-4">
        {/* Title */}
        <ThemedText className="text-3xl font-grotes-bold mb-1 text-center">Create your account</ThemedText>
        <ThemedText className="mb-6 text-center text-base-content-2">Join us today! Enter your details below to get started</ThemedText>

        <View className="mb-4">
          {/* Email Input */}
          <CustomTextInput
            placeholder="Enter your shop Name"
            icon="shop"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            IconComponent={Entypo}
          />
        </View>
        <View className="mb-4">
          {/* Email Input */}
          <CustomTextInput
            placeholder="Enter your email"
            icon="email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            IconComponent={Fontisto}
          />
        </View>

        <View className="mb-4">
          {/* Email Input */}
          <CustomTextInput
            placeholder="Enter your phone number"
            icon="phone"
            value={email}
            onChangeText={setEmail}
            keyboardType="phone-pad"
            autoCapitalize="none"
            IconComponent={Feather}
          />
        </View>

        {/* Password Input */}
        <View className="mb-4">
          <CustomTextInput
            placeholder="Enter your password"
            icon="lock"
            value={password}
            onChangeText={setPassword}
            autoCapitalize="none"
            IconComponent={SimpleLineIcons}
            secureTextEntry
          />
        </View>

        <CustomTextInput
          placeholder="Enter confirm password"
          icon="lock"
          value={password}
          onChangeText={setPassword}
          autoCapitalize="none"
          IconComponent={SimpleLineIcons}
          secureTextEntry
        />

        {/* Login Button */}
        <PrimaryButton
          title="Signup"
          // disabled={!isFormValid}
          onPress={handleLogin}
          className="mb-6 mt-10"
        />

        {/* Or continue with */}
        <View className="flex-row items-center mt-5 mb-10">
          <View className="flex-1 h-[1px] bg-base-content/10" />
          <ThemedText className="mx-3 text-sm text-base-content-2">Or Continue With</ThemedText>
          <View className="flex-1 h-[1px] bg-base-content/10" />
        </View>

        {/* Social Buttons */}
        <View className="flex-row justify-center  gap-5 space-x-4 mb-6">
          <TouchableOpacity
            onPress={handleGoogleLogin}
            className="flex-row items-center justify-center border border-base-content-20 bg-base-200 rounded-lg px-6 py-3 flex-1"
          >
            {/* Google Logo SVG */}
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

            <ThemedText className="ml-2">Google</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleFacebookLogin}
            className="flex-row items-center justify-center border border-base-content-20 bg-base-200 rounded-lg px-6 py-3 flex-1"
          >
            <AppIcon
              IconComponent={MaterialIcons}
              name="facebook"
              size={28}
              // color="#1877F2"
              className="text-[#1877F2]"
            />

            <ThemedText className="ml-2">Facebook</ThemedText>
          </TouchableOpacity>
        </View>

        {/* Signup Text */}
        <View className="flex-row justify-center mt-4">
          <ThemedText className="text-base-content-70 mr-1">Already have an account?</ThemedText>
          <TouchableOpacity onPress={() => navigation.navigate("Login")}>
            <ThemedText className="text-primary font-grotes-bold underline">Login</ThemedText>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
