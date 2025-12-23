import { Modal, ModalBackdrop, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter } from "@/components/ui/modal";
import { Icon, CloseIcon } from "@/components/ui/icon";
import { useRef, useState } from "react";
import { ThemedText } from "@/src/widgets/ThemeText";
import { TextInput, View, TextInput as RNTextInput, TouchableOpacity } from "react-native";
import { PrimaryButton } from "@/src/widgets/Button";
import { useNavigation } from "@react-navigation/native";
import { axiosInstance } from "@/src/utils/axios";
import { Helper } from "@/src/utils/Helper";
import { useDispatch } from "react-redux";
import { setUser } from "@/src/redux/slices/userSlice";

const LoginModal = ({ showModal, setShowModal, phoneNumber }: any) => {
  const [isLoading, setIsLoading] = useState(false);
  const [otp, setOtp] = useState(["1", "2", "3", "4", "5", "6"]);
  const [error, setError] = useState<string | null>(null);

  const inputs = useRef<(RNTextInput | null)[]>([]);
  const navigation = useNavigation<any>();

  const dispatch = useDispatch();

  const handleSubmit = async () => {
    const enteredPin = otp.join("");

    // Validate PIN first
    if (enteredPin.length < 6) {
      setError("Please enter a valid 6-digit PIN.");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const isOnline = await Helper.checkInternet();

      if (!isOnline) return;

      // Example request — replace with your API
      const res = await axiosInstance.post("/auth/login", { phone: phoneNumber, password: enteredPin });

      console.log("res::", res)

      if (res.data?.success) {
        setShowModal(false);
        Helper.res(res);
        dispatch(setUser({ user: res?.data?.data?.user, loginTime: Date.now() }));
        if (res?.data?.data?.user?.email) {
          navigation.navigate("Dashboard");
        } else {
          navigation.navigate("BackupSettings");
        }
      } else {
        setError(res?.data?.message);
      }

      setIsLoading(false);
    } catch (err: any) {
      setIsLoading(false);
      setError(err?.response?.data?.message);
      Helper.res(err);
    }
  };

  const handleForgotPIN = () => {
    setShowModal(false);
    navigation.navigate("ForgotPassword");
  };

  return (
    <Modal isOpen={showModal} onClose={() => setShowModal(false)} size="lg">
      <ModalBackdrop />
      <ModalContent className="bg-base-200 border-base-content-20">
        <ModalHeader>
          <ThemedText className="text-2xl font-grotes-bold">Enter Your PIN</ThemedText>
          <ModalCloseButton>
            <Icon as={CloseIcon} className="text-base-content-70" />
          </ModalCloseButton>
        </ModalHeader>

        <ModalBody>
          <View className="">
            <ThemedText className="text-base text-base-content-70 mb-1">Please enter your 6-digit PIN to access your account.</ThemedText>

            <TouchableOpacity onPress={handleForgotPIN}>
              <ThemedText className="text-sm text-primary font-grotes underline">Forgot PIN?</ThemedText>
            </TouchableOpacity>
          </View>

          {/* OTP Inputs */}
          <View className="flex-row justify-between gap-1 xs:gap-2 mb-1 mt-6">
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                ref={ref => (inputs.current[index] = ref)}
                value={digit ? "•" : ""}
                onFocus={() => {
                  // auto-clear when focusing into an already filled cell
                  if (otp[index] !== "") {
                    const newOtp = [...otp];
                    newOtp[index] = "";
                    setOtp(newOtp);
                  }
                }}
                onChangeText={text => {
                  const clean = text.replace(/\D/g, "");
                  const digitValue = clean.slice(-1);

                  const newOtp = [...otp];
                  newOtp[index] = digitValue || "";
                  setOtp(newOtp);

                  if (digitValue && index < 5) {
                    inputs.current[index + 1]?.focus();
                  }
                }}
                onKeyPress={({ nativeEvent }) => {
                  if (nativeEvent.key === "Backspace") {
                    const newOtp = [...otp];
                    newOtp[index] = "";
                    setOtp(newOtp);

                    // If this field is already empty → move to previous
                    if (index > 0 && otp.at(-1) === "") {
                      inputs.current[index - 1]?.focus();
                    }
                  }
                }}
                maxLength={1}
                textAlignVertical="center"
                keyboardType="numeric"
                className={` w-10 h-10  sm:w-12 sm:h-12 p-0 border rounded-lg text-center text-lg sm:text-xl bg-base-100 ${
                  error ? "border-error text-error" : "border-base-content-20 text-base-content-70"
                }`}
              />
            ))}
          </View>

          {error && <ThemedText className="text-error text-sm mt-2 text-center">{error}</ThemedText>}
        </ModalBody>

        <ModalFooter className="flex justify-center">
          <PrimaryButton title="Login" onPress={handleSubmit} className="mt-5 w-full mb-3" disabled={isLoading} />
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default LoginModal;
