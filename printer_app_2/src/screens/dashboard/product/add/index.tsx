import {
  FormControl,
  FormControlLabel,
  FormControlLabelText,
  FormControlHelper,
  FormControlHelperText,
  FormControlErrorIcon,
} from "@/components/ui/form-control";

import { AlertCircleIcon, CircleIcon } from "@/components/ui/icon";
import TopBottomNav from "@/src/layouts/TopBottomNav";
import CustomInput from "@/src/widgets/CustomInput";
import { useEffect, useRef, useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from "react-native";
import Lucide from "@react-native-vector-icons/lucide";
import { Formik } from "formik";
import { PrimaryButton } from "@/src/widgets/Button";
import { Grid, GridItem } from "@/components/ui/grid";
import CustomSelect from "@/src/widgets/CustomSelect";
import ImageUploader from "@/src/components/ImageUploader";
import CustomRadioGroup from "@/src/widgets/CustomRadio";
import { axiosInstance } from "@/src/utils/axios";
import { ValidationSchema } from "@/src/utils/formik/ValidationSchema";
import { Helper } from "@/src/utils/Helper";
import { useDispatch, useSelector } from "react-redux";
import { KeyboardAwareScrollView } from "@codler/react-native-keyboard-aware-scroll-view";
import { useRealm } from "@realm/react";
import NetInfo from "@react-native-community/netinfo";
import { createOfflineProduct, syncProductsToServer, updateOfflineProduct } from "@/src/database/services/productService";
import AppToast from "@/src/widgets/CustomToast";
import { getLocalCategories } from "@/src/database/services/category.service";
import { setItemDetails } from "@/src/redux/slices/commonSlice";
import { useNavigation, useRoute } from "@react-navigation/native";
import { saveImageToRealm } from "@/src/database/services/image.service";
import { Button, ButtonText } from "@/components/ui/button";
import AppIcon from "@/src/components/AppIcon";

const units = [
  // Common / Default
  "piece",
  "plate",
  "serving",
  "portion",

  // Count / Pack
  "pack",
  "box",
  "bottle",
  "can",
  "jar",
  "bag",
  "carton",
  "dozen",
  "set",
  "bundle",

  // Weight
  "gram",
  "kilogram",
  "milligram",
  "pound",
  "ounce",

  // Liquid
  "milliliter",
  "liter",
  "glass",
  "cup",
  "mug",

  // Length / Size (for items like rolls, sheets, foil, etc.)
  "inch",
  "foot",
  "meter",

  "others",
];

const AddProduct = () => {
  const [values, setValues] = useState("Mango");
  const [isLoading, setIsLoading] = useState<any>(null);
  const [data, setData] = useState<any>(null);
  const [data2, setData2] = useState<any>(null);

  const { itemDetails } = useSelector((State: any) => State.common);
  const { user } = useSelector((State: any) => State.user);

  const navigation = useNavigation<any>();

  const realm = useRealm();
  const [isOnline, setIsOnline] = useState<boolean | null>(null);

  const dispatch = useDispatch();
  const route = useRoute();

  const scrollRef = useRef<ScrollView>(null);

  // 🔥 Load from Realm (offline)
  const loadLocal = async () => {
    const res = await getLocalCategories(realm);
    setData2(res);
  };

  // Initial load
  useEffect(() => {

    if (itemDetails && route.name !== "Edit Product") {


      dispatch(setItemDetails(null));
    }
    loadLocal();
  }, [route.name]);

  const handleSubmit = async (values: any) => {
    try {
      setIsLoading(true);

      let imageObj = null;

      // If user selected a new image
      if (values.image?.uri) {

        imageObj = await saveImageToRealm(realm, values.image.uri);
      }

      const offline_form_values = {
        name: values.name,
        image: imageObj ?? undefined,
        isActive: values.isActive,
        unit: values.unit?.value ? values.unit : null,
        purchasePrice: Number(values.purchasePrice),
        sellingPrice: Number(values.sellingPrice),
        stock: Number(values.stock),
        categoryId: values.categoryId?.value ? values.categoryId : null,
        // brandId: values.brandId?.value ? values.brandId : null,
        userId: user?._id, // get current user from Redux/auth
      };

      let res = null;



      if (!itemDetails) {
        res = await createOfflineProduct(realm, offline_form_values);
      } else {
        res = await updateOfflineProduct(realm, `${itemDetails?.localId}`, offline_form_values);
      }

      if (res) {
        AppToast.success("Success!", `Product ${itemDetails ? "updated" : "created"} successfully`);

        if (itemDetails) {
          navigation.navigate("Product List");
          return;
        }
      }
    } catch (error) {

      Helper.res(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <TopBottomNav>
      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 50, // 🔥 add bottom padding
          flexGrow: 1, // ensures ScrollView takes full height
        }}
      >
        {/* Header */}
        <View className="flex-row justify-end mb-4">
          <Button variant="solid" size={"sm"} className="w-fit" onPress={() => navigation.navigate("Product List")}>
            <AppIcon name="add-circle" className="text-white text-xl" />
            <ButtonText>Product List</ButtonText>
          </Button>
        </View>
        <Formik
          initialValues={
            itemDetails
              ? {
                  name: itemDetails.name,
                  unit: { label: itemDetails?.unit?.label, value: itemDetails?.unit?.value },
                  categoryId: { label: itemDetails.categoryId?.label, value: itemDetails.categoryId?.value },
                  brandId: { label: itemDetails.brandId?.label, value: itemDetails.brandId?.value },
                  purchasePrice: itemDetails.purchasePrice,
                  sellingPrice: itemDetails.sellingPrice,
                  tax: itemDetails.tax,
                  stock: itemDetails.stock,
                  isActive: itemDetails.isActive,
                  image: itemDetails.image,
                }
              : {
                  name: "",
                  unit: "",
                  purchasePrice: "",
                  sellingPrice: "",
                  tax: "",
                  stock: "",
                  isActive: true,
                  categoryId: "",
                  image: "",
                }
          }
          validationSchema={ValidationSchema.addProduct}
          enableReinitialize={true} // <-- FIX
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

                {/* Product Name */}
                <GridItem _extra={{ className: "col-span-2" }}>
                  <FormControl>
                    <CustomInput
                      label="Product Name*"
                      icon="book-outline"
                      placeholder="e.g Spicy pizza"
                      value={values.name}
                      onChangeText={handleChange("name")}
                      error={submitCount > 0 && errors.name ? errors.name : undefined}
                    />
                  </FormControl>
                </GridItem>

                {/* Unit */}
                <GridItem _extra={{ className: "col-span-2" }}>
                  <FormControl>
                    <CustomSelect
                      label="Unit*"
                      items={units.map(item => ({ label: item, value: item }))}
                      placeholder="e.g piece"
                      icon="cube-outline"
                      value={values.unit} // Bind Formik value
                      onSelect={(val: any) => setFieldValue("unit", val)} // Update Formik state
                      error={submitCount > 0 && errors.unit ? errors.unit : undefined}
                    />
                  </FormControl>
                </GridItem>

                <GridItem _extra={{ className: "col-span-2" }}>
                  <FormControl>
                    <CustomSelect
                      label="Category"
                      items={data2?.categories?.map((item: any) => ({ label: item.name, value: item.localId }))}
                      placeholder="Enter category"
                      icon="layers-outline"
                      value={values.categoryId} // Bind Formik value
                      onSelect={(val: any) => setFieldValue("categoryId", val)} // Update Formik state
                      error={submitCount > 0 && errors.categoryId ? errors.categoryId : undefined}
                      navigationLink="Add Category"
                    />
                  </FormControl>
                </GridItem>

                {/* Purchase Price */}
                <GridItem _extra={{ className: "col-span-1" }}>
                  <FormControl>
                    <CustomInput
                      label="Purchase Price*"
                      icon="pricetag-outline"
                      placeholder="e.g 300"
                      value={values.purchasePrice}
                      onChangeText={handleChange("purchasePrice")}
                      keyboardType="number-pad"
                      error={submitCount > 0 && errors.purchasePrice ? errors.purchasePrice : undefined}
                      onFocus={() => {
                        setTimeout(() => {
                          scrollRef.current?.scrollToEnd({ animated: true });
                        }, 100);
                      }}
                    />
                  </FormControl>
                </GridItem>

                {/* Selling Price */}
                <GridItem _extra={{ className: "col-span-1" }}>
                  <FormControl>
                    <CustomInput
                      label="Selling Price*"
                      icon="pricetags-outline"
                      placeholder="e.g 500"
                      value={values.sellingPrice}
                      onChangeText={handleChange("sellingPrice")}
                      keyboardType="number-pad"
                      error={submitCount > 0 && errors.sellingPrice ? errors.sellingPrice : undefined}
                      onFocus={() => {
                        setTimeout(() => {
                          scrollRef.current?.scrollToEnd({ animated: true });
                        }, 100);
                      }}
                    />
                  </FormControl>
                </GridItem>

                {/* Stock */}
                <GridItem _extra={{ className: "col-span-1" }}>
                  <FormControl>
                    <CustomInput
                      label="Stock*"
                      icon="server-outline"
                      placeholder="e.g 12"
                      value={values.stock}
                      onChangeText={handleChange("stock")}
                      keyboardType="number-pad"
                      error={submitCount > 0 && errors.stock ? errors.stock : undefined}
                      onFocus={() => {
                        setTimeout(() => {
                          scrollRef.current?.scrollToEnd({ animated: true });
                        }, 100);
                      }}
                    />
                  </FormControl>
                </GridItem>

                <GridItem _extra={{ className: "col-span-2" }}>
                  <FormControl>
                    <CustomRadioGroup
                      label="Status*"
                      options={[
                        { label: "Active", value: true },
                        { label: "Disable", value: false },
                      ]}
                      value={values.isActive}
                      onChange={val => setFieldValue("isActive", val)}
                      error={submitCount > 0 && errors.isActive ? errors.isActive : undefined}
                    />
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
      </ScrollView>
    </TopBottomNav>
  );
};

export default AddProduct;
