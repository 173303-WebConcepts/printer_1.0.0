import React, { useState, useRef, useEffect } from "react";
import { View, TextInput, TouchableOpacity, TextInput as RNTextInput } from "react-native";
import { ThemedText } from "../../widgets/ThemeText";
import { PrimaryButton } from "../../widgets/Button";
import LinearGradient from "react-native-linear-gradient";

export default function OtpScreen() {
  const [otp, setOtp] = useState(["", "", "", ""]);

  const inputs = useRef<(RNTextInput | null)[]>([]);

  // Timer state
  const [counter, setCounter] = useState(120); // 2 minutes
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (counter > 0) {
      timer = setInterval(() => {
        setCounter(prev => prev - 1);
      }, 1000);
    } else {
      setCanResend(true);
    }
    return () => clearInterval(timer);
  }, [counter]);

  const handleChange = (text: string, index: number) => {
    if (/^\d*$/.test(text)) {
      const newOtp = [...otp];
      newOtp[index] = text;
      setOtp(newOtp);

      if (text && index < otp.length - 1) {
        inputs.current[index + 1]?.focus();
      }
    }
  };

  const handleVerify = () => {
    const code = otp.join("");

  };

  const handleResend = () => {

    setOtp(["", "", "", ""]);
    setCounter(120);
    setCanResend(false);
    inputs.current[0]?.focus();
  };

  // format counter as MM:SS
  const formatTime = (sec: number) => {
    const minutes = Math.floor(sec / 60)
      .toString()
      .padStart(2, "0");
    const seconds = (sec % 60).toString().padStart(2, "0");
    return `${minutes}:${seconds}`;
  };

  return (
    <View className="flex-1 justify-center px-6">
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

      {/* Title */}
      <ThemedText className="text-3xl font-grotes-bold mb-1 text-center">Verify OTP</ThemedText>
      <ThemedText className="mb-6 text-center text-base-content-2">Enter the 4-digit code sent to your email</ThemedText>

      {/* OTP Inputs */}
      <View className="flex-row justify-center gap-5 mb-8">
        {otp.map((digit, index) => (
          <TextInput
            key={index}
            ref={ref => {
              inputs.current[index] = ref;
            }}
            value={digit}
            onChangeText={text => handleChange(text, index)}
            onKeyPress={({ nativeEvent }) => {
              if (nativeEvent.key === "Backspace" && !digit && index > 0) {
                inputs.current[index - 1]?.focus();
                const newOtp = [...otp];
                newOtp[index - 1] = "";
                setOtp(newOtp);
              }
            }}
            maxLength={1}
            keyboardType="number-pad"
            className="w-14 h-14 border border-base-content-20 rounded-lg text-center text-xl text-base-content-70 bg-base-200"
          />
        ))}
      </View>

      {/* Verify Button */}
      <PrimaryButton title="Verify" disabled={otp.some(digit => digit === "")} onPress={handleVerify} />

      {/* Resend Code */}
      <View className="flex-row justify-center mt-6 items-center">
        <ThemedText className="text-base-content-70 mr-1">Didn’t receive code?</ThemedText>
        <TouchableOpacity disabled={!canResend} onPress={handleResend}>
          <ThemedText className={`font-grotes-bold underline ${canResend ? "text-primary" : "text-base-content-50"}`}>Resend</ThemedText>
        </TouchableOpacity>
        {!canResend && <ThemedText className="ml-2 text-base-content-50">{formatTime(counter)}</ThemedText>}
      </View>
    </View>
  );
}
