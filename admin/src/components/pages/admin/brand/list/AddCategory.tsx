"use client";
import { setItemDetails } from "@/redux/slices/commonSlice";
import { axiosInstance } from "@/utils/axios";
import { ValidationSchema } from "@/utils/formik/ValidationSchema";
import CustomInput from "@/widgets/CustomInput";
import { CustomMultiTextInput } from "@/widgets/CustomMultiSelectInput";
import { CustomSelect } from "@/widgets/CustomSelect";
import Toast from "@/widgets/CustomToast";
import { Field, Form, Formik } from "formik";
import React, { useEffect, useState } from "react";
import { BiCategory } from "react-icons/bi";
import { MdOutlineFilterListOff } from "react-icons/md";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import * as Yup from "yup";

const AddCategory = ({ refreshCategories }: { refreshCategories: any }) => {
  const [isLoading, setIsLoading] = useState<any>(null);
  const [shopTypesData, setShopTypesData] = useState<any>(null);

  const { itemDetails } = useSelector((state: any) => state.common);

  const dispatch = useDispatch();

  useEffect(() => {
    get();
  }, []);

  const get = async () => {
    setIsLoading(true);

    try {
      const res = await axiosInstance.get("/user/shoptypes");

      setShopTypesData(res?.data?.data || []);
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      // Handle error
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      setIsLoading(true);

      let res;

      const form_data = itemDetails
        ? {
            name: values.name,
            shopType: values.shopType.value,
          }
        : {
            brands: values.brands?.map((item: any) => item.value),
            shopType: values.shopType.value,
          };

      if (itemDetails) {
        res = await axiosInstance.put(`/category/brand/update/${itemDetails?._id}`, form_data);
      } else {
        res = await axiosInstance.post("/category/brand/create", form_data);
      }

      if (res.data.success) {
        Toast.success(res.data.message);
        refreshCategories();
      } else {
        Toast.error("Error Occur!!");
      }
      setIsLoading(false);
    } catch (error: any) {

      setIsLoading(false);
      Toast.error(error.response.data.message);
    }
  };

  const handleClearFilter = () => {
    dispatch(setItemDetails(null));
  };

  return (
    <div>
      <Formik
        enableReinitialize
        initialValues={
          itemDetails
            ? {
                name: itemDetails?.name || "",
                shopType: itemDetails?.shopType ? { label: itemDetails?.shopType?.type, value: itemDetails?.shopType?._id } : "",
                brands: [],
              }
            : {
                brands: [],
                name: "",
                shopType: itemDetails?.shopType ? { label: itemDetails?.shopType?.type, value: itemDetails?.shopType?._id } : "",
              }
        }
        validationSchema={
          itemDetails
            ? ValidationSchema.category
            : Yup.object({
                brands: Yup.array()
                  .of(
                    Yup.object({
                      label: Yup.string().trim().required("Brand name is required"),
                      value: Yup.string().trim().required("Brand value is required"),
                    })
                  )
                  .min(1, "At least one Bband is required"),
                shopType: Yup.object().required("Shop type is required").typeError("Shop type is required"),
              })
        }
        onSubmit={handleSubmit}
      >
        {({ values, setFieldValue, errors, touched, submitCount, handleSubmit: formikSubmit }): any => (
          <Form onSubmit={formikSubmit}>
            <div className="bg-base-100 mb-10 rounded-md p-5 md:p-7">
              <div className="flex gap-5">
                <h4>Add Brand</h4>
                {itemDetails && (
                  <button type="button" className="btn btn-sm btn-error mr-2" onClick={handleClearFilter}>
                    <MdOutlineFilterListOff className="text-[19px]" />
                    Clear Edit
                  </button>
                )}
              </div>

              <div className="mt-5 grid grid-cols-1 gap-10 sm:grid-cols-2">
                {itemDetails ? (
                  <Field label="Name*" value={values.name} name={`name`} type="text" component={CustomInput} placeholder={`e.g Travel`} />
                ) : (
                  <Field component={CustomMultiTextInput} name="brands" label="Brands*" placeholder="Type and press Enter..." icon={<BiCategory />} />
                )}
                <Field
                  component={CustomSelect}
                  label={"Shop Type*"}
                  value={values.shopType}
                  name={`shopType`}
                  placeholder="e.g Restaurant"
                  options={
                    shopTypesData?.shoptypes && shopTypesData?.shoptypes?.length > 0
                      ? shopTypesData?.shoptypes?.map((item: any) => ({
                          label: item.type,
                          value: item._id,
                        }))
                      : []
                  }
                  isDisabled={itemDetails ? true : false}
                />
              </div>

              <div className="mt-5 flex justify-end">
                <button type="submit" disabled={isLoading} className="btn btn-primary capitalize">
                  submit {isLoading && <span className="loading loading-spinner"></span>}
                </button>
              </div>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default AddCategory;
