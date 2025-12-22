"use client";
import { setItemDetails } from "@/redux/slices/commonSlice";
import { axiosInstance } from "@/utils/axios";
import { ValidationSchema } from "@/utils/formik/ValidationSchema";
import CustomInput from "@/widgets/CustomInput";
import { CustomMultiTextInput } from "@/widgets/CustomMultiSelectInput";
import Toast from "@/widgets/CustomToast";
import { Field, Form, Formik } from "formik";
import { useParams } from "next/navigation";
import React, { useState } from "react";
import { BiCategory } from "react-icons/bi";
import { MdOutlineFilterListOff } from "react-icons/md";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import * as Yup from "yup";

const AddCategory = ({ refreshCategories }: { refreshCategories: any }) => {
  const [isLoading, setIsLoading] = useState<any>(null);
  const { userId } = useParams();

  const { itemDetails } = useSelector((state: any) => state.common);

  const dispatch = useDispatch();

  const handleSubmit = async (values: any) => {
    try {
      setIsLoading(true);
      let res;

      const form_data = itemDetails
        ? {
            name: values.name,
          }
        : {
            brands: values.brands?.map((item: any) => item.value),
            userIdByAdmin: userId ? userId[0] : "",
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
                brands: [],
              }
            : {
                brands: [],
                name: "",
              }
        }
        validationSchema={
          itemDetails
            ? ValidationSchema.shopCategory
            : Yup.object({
                brands: Yup.array()
                  .of(
                    Yup.object({
                      label: Yup.string().trim().required("Brand name is required"),
                      value: Yup.string().trim().required("Brand value is required"),
                    })
                  )
                  .min(1, "At least one brand is required"),
              })
        }
        onSubmit={handleSubmit}
      >
        {({ values, setFieldValue, errors, touched, submitCount, handleSubmit: formikSubmit }): any => (
          <Form onSubmit={formikSubmit}>
            <div className="bg-base-100 mb-10 rounded-md p-5 md:p-7">
              <div className="flex gap-5">
                <h4>Add User Brand</h4>
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
                )}{" "}
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
