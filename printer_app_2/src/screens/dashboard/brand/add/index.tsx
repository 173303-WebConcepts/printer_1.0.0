import React, { useState } from "react";
import CustomMultiTextInput from "@/src/widgets/CustomMultiTextInput";
import * as Yup from "yup";
import { Formik } from "formik";
import { PrimaryButton } from "@/src/widgets/Button";
import { axiosInstance } from "@/src/utils/axios";
import { Helper } from "@/src/utils/Helper";
import TopBottomNav from "@/src/layouts/TopBottomNav";
import { KeyboardAvoidingView, ScrollView, View } from "react-native";
import { Button, ButtonText } from "@/components/ui/button";
import AppIcon from "@/src/components/AppIcon";
import { useNavigation } from "@react-navigation/native";

const AddBrand = () => {
  const [loading, setLoading] = useState(false);

  const navigation = useNavigation<any>();

  const handleSubmit = async (values: any) => {
    try {
      setLoading(true);
      const form_data = {
        brands: values.brands, // now it's array of strings
      };

      const res = await axiosInstance.post("/category/brand/create", form_data);
      if (res.data.success) Helper.res(res);
    } catch (error: any) {
      Helper.res(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <TopBottomNav>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior="height">
        <ScrollView className="px-4" keyboardShouldPersistTaps="handled">
          <Formik
            initialValues={{ brands: [] }}
            validationSchema={Yup.object({
              categories: Yup.array().of(Yup.string().trim().required("Brand name is required")).min(1, "At least one brand is required"),
            })}
            onSubmit={handleSubmit}
          >
            {({ handleSubmit, values, setFieldValue, errors, submitCount }) => (
              <>
                <View className="flex-row justify-end">
                  <Button variant="solid" size={"sm"} className="mt-2 w-fit" onPress={() => navigation.navigate("Brand List")}>
                    <AppIcon name="list-circle" className="text-white text-xl" />
                    <ButtonText>Brand List</ButtonText>
                  </Button>
                </View>

                <CustomMultiTextInput
                  label="Add Brands*"
                  value={values.brands}
                  onChange={val => setFieldValue("brands", val)}
                  placeholder="Enter brand name"
                  error={submitCount > 0 && errors.brands ? (errors.brands as string) : undefined}
                />

                <View className="pb-20">
                  <PrimaryButton title={loading ? "Submitting..." : "Submit"} onPress={handleSubmit} disabled={loading} className="mt-10" />
                </View>
              </>
            )}
          </Formik>
        </ScrollView>
      </KeyboardAvoidingView>
    </TopBottomNav>
  );
};

export default AddBrand;
