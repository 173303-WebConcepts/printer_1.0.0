import { View, TouchableOpacity } from "react-native";
import { Formik } from "formik";
import * as Yup from "yup";
import { ThemedText } from "../../widgets/ThemeText";
import CustomTextInput from "../../widgets/CustomTextInput";
import { PrimaryButton } from "../../widgets/Button";
import Fontisto from "@react-native-vector-icons/fontisto";
import Ionicons from "@react-native-vector-icons/ionicons";
import AppIcon from "../../components/AppIcon";
import LinearGradient from "react-native-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import AppToast from "@/src/widgets/CustomToast";
import { axiosInstance } from "@/src/utils/axios";
import { VStack } from "@/components/ui/vstack";
import { FormControl } from "@/components/ui/form-control";
import CustomInput from "@/src/widgets/CustomInput";
import { Helper } from "@/src/utils/Helper";
import ResetPasswordModal from "./ResetPasswordModal";
import { useState } from "react";

const ForgotPasswordSchema = Yup.object().shape({
  email: Yup.string().email("Invalid email").required("Email is required"),
});

export default function ForgotPasswordScreen() {
  const [showModal, setShowModal] = useState(false);

  const navigation = useNavigation<any>();

  const handleSubmitForm = async (values: any, { setSubmitting }: any) => {
    try {
      const isOnline = await Helper.checkInternet();
      if (!isOnline) return;

      const response = await axiosInstance.post("/auth/send-otp-code", {
        email: values.email.trim(),
      });

      if (response?.data?.success) {
        setShowModal(true);
        navigation.navigate("Login");
      }

      Helper.res(response);
    } catch (error: any) {
      Helper.res(error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View className="flex-1 justify-center relative">
      {/* Back button */}
      <TouchableOpacity className="absolute top-5 left-5" onPress={() => navigation.goBack()}>
        <AppIcon IconComponent={Ionicons} name="return-down-back" size={28} className="text-base-content-70" />
      </TouchableOpacity>

      {/* Gradient */}
      <LinearGradient
        colors={["rgba(253, 104, 13, 0.2)", "rgba(253, 104, 13, 0.1)", "rgba(15, 17, 18, 0.5)"]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 0.5 }}
        style={{ position: "absolute", top: 0, left: 0, right: 0, height: "50%" }}
        pointerEvents="none"
      />

      <View className="px-4">
        <ThemedText className="text-3xl font-grotes-bold mb-1 text-center">Forgot PIN?</ThemedText>

        <ThemedText className="mb-10 text-center text-base-content-2">
          Enter your email and we’ll send you instructions to reset your PIN.
        </ThemedText>

        {/* 🔥 FORM START */}
        <Formik initialValues={{ email: "" }} validationSchema={ForgotPasswordSchema} onSubmit={handleSubmitForm}>
          {({ handleChange, handleSubmit, values, errors, submitCount, isSubmitting }) => (
            <>
              <VStack>
                <FormControl>
                  <CustomInput
                    label="Email*"
                    icon="mail-outline"
                    placeholder="e.g name@gmail.com"
                    value={values.email}
                    onChangeText={handleChange("email")}
                    error={submitCount > 0 && errors.email ? errors.email : undefined}
                    IconComponent={Ionicons}
                  />
                </FormControl>

                <PrimaryButton
                  title={isSubmitting ? "Submitting..." : "Submit"}
                  onPress={handleSubmit}
                  disabled={isSubmitting}
                  className="mt-8"
                />

                <ResetPasswordModal showModal={showModal} setShowModal={setShowModal} email={values.email} />
              </VStack>
            </>
          )}
        </Formik>
        {/* 🔥 FORM END */}
      </View>
    </View>
  );
}
