import { FormControl, FormControlErrorIcon } from "@/components/ui/form-control";

import { AlertCircleIcon } from "@/components/ui/icon";
import TopBottomNav from "@/src/layouts/TopBottomNav";
import { useEffect, useState } from "react";
import { Text, View } from "react-native";
import { Formik } from "formik";
import { PrimaryButton } from "@/src/widgets/Button";
import { Grid, GridItem } from "@/components/ui/grid";
import ImageUploader from "@/src/components/ImageUploader";
import { ValidationSchema } from "@/src/utils/formik/ValidationSchema";
import { Helper } from "@/src/utils/Helper";
import { useDispatch, useSelector } from "react-redux";
import { KeyboardAwareScrollView } from "@codler/react-native-keyboard-aware-scroll-view";
import { useRealm } from "@realm/react";
import AppToast from "@/src/widgets/CustomToast";
import { useNavigation, useRoute } from "@react-navigation/native";
import { saveImageToRealm } from "@/src/database/services/image.service";
import { createOfflineProfile, updateOfflineProfile } from "@/src/database/services/profile.service";
import { setItemDetails } from "@/src/redux/slices/commonSlice";

const Profile = () => {
  const [isLoading, setIsLoading] = useState<any>(null);

  const { itemDetails } = useSelector((State: any) => State.common);

  const realm = useRealm();

  const dispatch = useDispatch();

  const navigation = useNavigation();

  const handleSubmit = async (values: any) => {
    try {
      setIsLoading(true);

      let imageObj = null;

      // If user selected a new image
      if (values.image?.uri) {

        imageObj = await saveImageToRealm(realm, values.image.uri);
      }

      const offline_form_values = {
        image: imageObj ?? undefined,
      };

      let res = null;



      if (!itemDetails) {

        res = await createOfflineProfile(realm, offline_form_values);
      } else {

        res = await updateOfflineProfile(offline_form_values);
      }


      if (res) {
        AppToast.success("Success!", `Profile Pic ${itemDetails ? "updated" : "created"} successfully`);

        if (itemDetails) {
          dispatch(setItemDetails(null));
          navigation.navigate("Main");
          return;
        }
      } else {
        AppToast.error("Oops!", "Error Occur");
      }
    } catch (error) {

      Helper.res(error);
    } finally {
      setIsLoading(false);
    }
  };



  return (
    <TopBottomNav>
      <Formik
        initialValues={
          itemDetails
            ? {
                image: itemDetails.image,
              }
            : {
                image: "",
              }
        }
        validationSchema={ValidationSchema.profile}
        enableReinitialize={!!itemDetails} // <-- FIX
        onSubmit={handleSubmit}
      >
        {({ handleChange, handleSubmit, values, errors, submitCount, setFieldValue }: any) => (
          <>
            {console.log(errors, values)}
            <Grid className="gap-4" _extra={{ className: "grid-cols-2" }}>
              <GridItem _extra={{ className: "col-span-2" }}>
                <FormControl>
                  <View
                    className={`border  bg-base-200 rounded-lg ${submitCount > 0 && errors.image ? "border-error" : "border-base-content-2/25"}`}
                  >
                    <View className="items-center my-6">
                      <ImageUploader setFieldValue={setFieldValue} value={values.image} />
                    </View>
                  </View>

                  {submitCount > 0 && errors && errors.image && (
                    <View className="flex-row items-center gap-1 mt-1">
                      <FormControlErrorIcon as={AlertCircleIcon} className="text-error" size={"sm"} />
                      <Text className="text-error text-sm font-grotes">{errors.image}</Text>
                    </View>
                  )}
                </FormControl>
              </GridItem>
            </Grid>

            <PrimaryButton title="Submit" onPress={handleSubmit} className="mt-10" disabled={isLoading} />

            {submitCount > 0 && Object.keys(errors).length > 0 && (
              <>
                <View className="flex-row items-center gap-1 mt-1">
                  <Text className="text-error text-sm font-grotes">
                    Form submition error occur, please fill the form with correct details.
                  </Text>
                </View>
              </>
            )}
          </>
        )}
      </Formik>
    </TopBottomNav>
  );
};

export default Profile;
