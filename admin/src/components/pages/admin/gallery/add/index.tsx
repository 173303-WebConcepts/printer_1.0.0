"use client";
import Toast from "@/widgets/CustomToast";
import { Field, Form, Formik } from "formik";
import { Fragment, useEffect, useState } from "react";

import { axiosInstance } from "@/utils/axios";
import FileUploaderMultiple from "./FileUploader";
import { Helper } from "@/utils/Helper";
import { CustomSelect } from "@/widgets/CustomSelect";
import { ValidationSchema } from "@/utils/formik/ValidationSchema";

const Gallery = () => {
  const [isLoading, setIsLoading] = useState<any>(null);
  const [data, setData] = useState<any>([]);

  useEffect(() => {
    get();
  }, []);

  const get = async () => {
    setIsLoading(true);

    try {
      const res = await axiosInstance.get("/user/shopTypes");

      setData(res?.data?.data || []);
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
    }
  };

  const uploadImages = async (formData: FormData) => {
    try {
      const res = await axiosInstance.post("/common/upload_images", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      return res;
    } catch (error: any) {
      console.error("Upload failed:", error?.response?.data || error.message);
      throw error;
    }
  };

  const handleSubmit = async (values: any) => {
    let response: any;

    try {
      setIsLoading(true);

      const formData: any = new FormData();
      values.images.forEach((item: any) => formData.append("images", item));
      response = await uploadImages(formData);

      if (response?.data?.success) {
        const images = response?.data?.data;

        const form_values = {
          shopType: values.shopType.value,
          images,
        };

        const res = await axiosInstance.post("/user/gallery", form_values);

        if (res?.data?.success) {
          return Helper.res(res);
        } else {
          return Helper.res(res);
        }
      }
    } catch (error: any) {
      return Helper.res(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Fragment>
      <div className="container my-[40px]">
        <h5 className="mb-3">Gallery Information</h5>

        <Formik enableReinitialize initialValues={{ images: [], shopType: "" }} validationSchema={ValidationSchema.gallery} onSubmit={handleSubmit}>
          {({ values, setFieldValue, errors, touched, submitCount, handleSubmit: formikSubmit }): any => (
            <Form onSubmit={formikSubmit}>
              <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div className="col-span-1">
                  <Field
                    component={CustomSelect}
                    label={"Shop Type*"}
                    value={values.shopType}
                    name={`shopType`}
                    placeholder="e.g Restaurant"
                    options={
                      data?.shoptypes && data?.shoptypes?.length > 0
                        ? data?.shoptypes.map((item: any) => ({
                            label: item.type,
                            value: item._id,
                          }))
                        : []
                    }
                  />
                </div>

                <div className="bg-base-100 col-span-2 rounded-md px-5 max-xl:col-span-2 md:p-10">
                  <h5>Upload Images</h5>

                  <div className="mt-2">
                    <FileUploaderMultiple
                      files={values.images}
                      name="images"
                      setFieldValue={setFieldValue}
                      error={submitCount > 0 ? errors.images : ""}
                      submitCount={submitCount}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-7 flex flex-col items-center justify-center gap-4">
                {submitCount > 0 && Object.keys(errors).length > 0 && (
                  <p className="text-error text-center">Form submition error occur, please fill the form with correct details.</p>
                )}

                <button type="submit" disabled={isLoading} className="btn btn-primary">
                  Submit {isLoading && <span className="loading loading-spinner text-primary"></span>}
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </Fragment>
  );
};

export default Gallery;
