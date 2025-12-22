import { Modal, ModalBackdrop, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter } from "@/components/ui/modal";
import { Icon, CloseIcon } from "@/components/ui/icon";
import { useRef, useState } from "react";
import { ThemedText } from "@/src/widgets/ThemeText";
import { TextInput, View } from "react-native";
import { PrimaryButton } from "@/src/widgets/Button";
import { useNavigation } from "@react-navigation/native";
import { axiosInstance } from "@/src/utils/axios";
import { Helper } from "@/src/utils/Helper";
import LinearGradient from "react-native-linear-gradient";
import TopBottomNav from "@/src/layouts/TopBottomNav";
import { ScrollView } from "react-native";

export default function ChangePIN() {
  const [isLoading, setIsLoading] = useState(false);

  // OTP (6 digits)
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const otpInputs = useRef<(TextInput | null)[]>([]);

  // New PIN (6 digits)
  const [newPin, setNewPin] = useState(["", "", "", "", "", ""]);
  const newPinInputs = useRef<(TextInput | null)[]>([]);

  // Confirm PIN (6 digits)
  const [confirmPin, setConfirmPin] = useState(["", "", "", "", "", ""]);
  const confirmPinInputs = useRef<(TextInput | null)[]>([]);

  const [error, setError] = useState<string | null>(null);
  const navigation = useNavigation<any>();

  // Handle digit typing
  const handleDigitChange = (text: string, index: number, field: "otp" | "new" | "confirm") => {
    setError(null);
    const clean = text.replace(/\D/g, "");

    if (field === "otp") {
      const digitValue = clean.slice(-1);
      const updated = [...otp];
      updated[index] = digitValue || "";
      setOtp(updated);
      if (digitValue && index < 5) otpInputs.current[index + 1]?.focus();
    }

    if (field === "new") {
      const updated = [...newPin];
      updated[index] = text;
      setNewPin(updated);
      if (text && index < 5) newPinInputs.current[index + 1]?.focus();
    }

    if (field === "confirm") {
      const updated = [...confirmPin];
      updated[index] = text;
      setConfirmPin(updated);
      if (text && index < 5) confirmPinInputs.current[index + 1]?.focus();
    }
  };

  // Handle backspace
  const handleBackspace = (key: string, index: number, field: "otp" | "new" | "confirm") => {
    if (key === "Backspace") {
      if (field === "otp") {
        const updated = [...otp];
        updated[index] = "";
        setOtp(updated);
        // If this field is already empty → move to previous
        if (index > 0 && otp.at(-1) === "") {
          otpInputs.current[index - 1]?.focus();
        }
      }

      if (field === "new") {
        const updated = [...newPin];
        updated[index] = "";
        setNewPin(updated);
        // If this field is already empty → move to previous
        if (index > 0 && newPin.at(-1) === "") {
          newPinInputs.current[index - 1]?.focus();
        }
      }

      if (field === "confirm") {
        const updated = [...confirmPin];
        updated[index] = "";
        setConfirmPin(updated);
        // If this field is already empty → move to previous
        if (index > 0 && confirmPin.at(-1) === "") {
          confirmPinInputs.current[index - 1]?.focus();
        }
      }
    }
  };

  // Empty submit
  const handleSubmit = async () => {
    const enteredOtp = otp.join("");
    const enteredNewPin = newPin.join("");
    const enteredConfirmPin = confirmPin.join("");

    if (enteredOtp.length < 6) return setError("Please enter the 6-digit OTP code sent to your email.");
    if (enteredNewPin.length < 6) return setError("New PIN must be 6 digits.");
    if (enteredNewPin !== enteredConfirmPin) return setError("New PIN and Confirm PIN do not match.");



    try {
      setIsLoading(true);

      const isOnline = await Helper.checkInternet();
      if (!isOnline) return;

      const response = await axiosInstance.put("/auth/change-password", {
        oldPassword: enteredOtp,
        newPassword: enteredNewPin,
      });

      if (response?.data?.success) {
        navigation.navigate("Main");
      }

      Helper.res(response);
    } catch (error: any) {
      Helper.res(error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderPinInputs = (values: string[], inputsRef: any, field: "otp" | "new" | "confirm") => (
    <View className="flex-row justify-between gap-2 mt-2">
      {values.map((digit, index) => (
        <TextInput
          key={index}
          ref={(ref: any) => (inputsRef.current[index] = ref)}
          value={digit ? (field === "otp" ? digit : "•") : ""}
          onFocus={() => {
            // Auto clear this field when focusing AND it's not empty
            if (values[index] !== "") {
              const updated = [...values];
              updated[index] = "";
              if (field === "otp") setOtp(updated);
              if (field === "new") setNewPin(updated);
              if (field === "confirm") setConfirmPin(updated);
            }
          }}
          onChangeText={text => handleDigitChange(text, index, field)}
          onKeyPress={({ nativeEvent }) => handleBackspace(nativeEvent.key, index, field)}
          maxLength={1}
          keyboardType="number-pad"
          secureTextEntry={false} // manually mask with "•" for new and confirm PIN
          className={`w-12 h-12 border rounded-lg text-center text-xl bg-base-100 ${
            error ? "border-error text-error" : "border-base-content-20 text-base-content-70"
          }`}
        />
      ))}
    </View>
  );

  return (
    <TopBottomNav>
      <ScrollView>
        <View className="flex-row min-h-[90%] items-center">
          <View className="px-5 py-5 bg-base-200 rounded-lg w-full">
            {/* OTP */}
            <ThemedText className="mt-6 font-grotes-medium text-base-content">CurrentPIN</ThemedText>
            {renderPinInputs(otp, otpInputs, "otp")}

            {/* New PIN */}
            <ThemedText className="mt-6 font-grotes-medium text-base-content">New PIN</ThemedText>
            {renderPinInputs(newPin, newPinInputs, "new")}

            {/* Confirm PIN */}
            <ThemedText className="mt-6 font-grotes-medium text-base-content">Confirm PIN</ThemedText>
            {renderPinInputs(confirmPin, confirmPinInputs, "confirm")}

            {error && <ThemedText className="text-error text-sm mt-3 text-center">{error}</ThemedText>}

            <PrimaryButton title="Change PIN" onPress={handleSubmit} className=" mb-3 w-full mt-10" disabled={isLoading} />
          </View>
        </View>
      </ScrollView>
    </TopBottomNav>
  );
}
