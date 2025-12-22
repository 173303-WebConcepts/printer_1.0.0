"use client";
import { axiosInstance } from "@/utils/axios";
import { ValidationSchema } from "@/utils/formik/ValidationSchema";
import CustomInput from "@/widgets/CustomInput";
import { CustomMultiTextInput } from "@/widgets/CustomMultiSelectInput";
import { CustomSelect } from "@/widgets/CustomSelect";
import Toast from "@/widgets/CustomToast";
import { Field, Form, Formik } from "formik";
import React, { useState } from "react";
import { CiShop } from "react-icons/ci";

const Add = ({ refreshCategories }: { refreshCategories: any }) => {
  const [isLoading, setIsLoading] = useState<any>(null);

  const handleSubmit = async (values: any) => {
    try {
      setIsLoading(true);

      const shopTypes = values.shopTypes.map((item: any) => item.value);

      const res = await axiosInstance.post("/user/shopType", { shopTypes });
      if (res.data.success) {
        Toast.success(res.data?.data?.message);
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

  return (
    <div>
      <Formik enableReinitialize initialValues={{ shopTypes: [] }} validationSchema={ValidationSchema.shopTypes} onSubmit={handleSubmit}>
        {({ values, setFieldValue, errors, touched, submitCount, handleSubmit: formikSubmit }): any => (
          <Form onSubmit={formikSubmit}>
            <div className="bg-base-100 mb-10 rounded-md p-5 md:p-7">
              <h4>Add Shop Type</h4>

              <div className="mt-5 grid grid-cols-1 gap-10 sm:grid-cols-2">
                <Field
                  component={CustomMultiTextInput}
                  name="shopTypes"
                  label="Shop Types*"
                  placeholder="Type and press Enter..."
                  icon={<CiShop />}
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

export default Add;
