"use client";
import { axiosInstance } from "@/utils/axios";
import { ValidationSchema } from "@/utils/formik/ValidationSchema";
import CustomInput from "@/widgets/CustomInput";
import Toast from "@/widgets/CustomToast";
import { Field, Form, Formik } from "formik";
import React, { useState } from "react";

const Add = ({ refreshCategories }: { refreshCategories: any }) => {
  const [isLoading, setIsLoading] = useState<any>(null);

  const handleSubmit = async (values: any) => {

    try {
      setIsLoading(true);
      const res = await axiosInstance.post("/category/create-technology", values);
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

  return (
    <div>
      <Formik enableReinitialize initialValues={{ name: "" }} validationSchema={ValidationSchema.category} onSubmit={handleSubmit}>
        {({ values, setFieldValue, errors, touched, submitCount, handleSubmit: formikSubmit }): any => (
          <Form onSubmit={formikSubmit}>
            <div className="bg-base-100 mb-10 rounded-md p-5 md:p-7">
              <h4>Add Technology</h4>

              <div className="mt-5 grid grid-cols-1 gap-10 sm:grid-cols-2">
                <Field label="Name*" value={values.name} name={`name`} type="text" component={CustomInput} placeholder={`e.g Travel`} />
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
