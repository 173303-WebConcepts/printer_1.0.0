import React, { useState } from "react";
import CustomMultiTextInput from "@/src/widgets/CustomMultiTextInput";
import * as Yup from "yup";
import { Formik } from "formik";
import { PrimaryButton } from "@/src/widgets/Button";
import { Helper } from "@/src/utils/Helper";
import TopBottomNav from "@/src/layouts/TopBottomNav";
import { KeyboardAvoidingView, ScrollView, View } from "react-native";
import { Button, ButtonText } from "@/components/ui/button";
import AppIcon from "@/src/components/AppIcon";
import { useNavigation } from "@react-navigation/native";
import { createMultipleOfflineCategories } from "@/src/database/services/category.service";
import { useRealm } from "@realm/react";
import { useOnlineStatus } from "@/src/hooks/useOnlineStatus";

const AddCategory = () => {
  const [loading, setLoading] = useState(false);

  const navigation = useNavigation<any>();

  const realm = useRealm();

  const handleSubmit = async (values: any) => {
    try {
      setLoading(true);

      createMultipleOfflineCategories(realm, values.categories);
    } catch (error: any) {
      Helper.res(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <TopBottomNav>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior="height">
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingBottom: 50, // 🔥 add bottom padding
            flexGrow: 1, // ensures ScrollView takes full height
          }}
        >
          <Formik
            initialValues={{ categories: [] }}
            validationSchema={Yup.object({
              categories: Yup.array()
                .of(Yup.string().trim().required("Category name is required"))
                .min(1, "At least one category is required"),
            })}
            onSubmit={handleSubmit}
          >
            {({ handleSubmit, values, setFieldValue, errors, submitCount }) => (
              <>
                <View className="flex-row justify-end">
                  <Button variant="solid" size={"sm"} className="mt-2 w-fit" onPress={() => navigation.navigate("Category List")}>
                    <AppIcon name="list-circle" className="text-white text-xl" />
                    <ButtonText>Category List</ButtonText>
                  </Button>
                </View>

                <CustomMultiTextInput
                  label="Add Categories*"
                  value={values.categories}
                  onChange={val => setFieldValue("categories", val)}
                  placeholder="Enter category name"
                  error={submitCount > 0 && errors.categories ? (errors.categories as string) : undefined}
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

export default AddCategory;
