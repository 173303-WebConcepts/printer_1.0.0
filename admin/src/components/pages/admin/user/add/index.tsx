"use client";
import CustomInput from "@/widgets/CustomInput";
import { CustomSelect } from "@/widgets/CustomSelect";
import Toast from "@/widgets/CustomToast";
import { Field, FieldArray, Form, Formik } from "formik";
import { Fragment, useEffect, useState } from "react";
import FileUploaderMultiple from "./FileUploader";
import { convertFromRaw, convertToRaw, EditorState } from "draft-js";
import { defaultContent } from "./DefaultData";
import dynamic from "next/dynamic";
import { ValidationSchema } from "@/utils/formik/ValidationSchema";
import { InitialValues } from "@/utils/formik/InitalValues";
import { Helper } from "@/utils/Helper";
import { MAX_CART_LIMIT, MIN_CART_LIMIT } from "./ContentEditor";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import CustomTextarea from "@/widgets/CustomTextarea";
import CustomRadio from "@/widgets/CustomRadio";
import { TbTournament } from "react-icons/tb";
import { FaClock, FaPhoneAlt, FaRegBuilding } from "react-icons/fa";
import { axiosInstance } from "@/utils/axios";
import SingleFileUploader from "./SingleFileUploader";
import { CiLock, CiShop } from "react-icons/ci";
import { FaShop } from "react-icons/fa6";
import { IoMdLock } from "react-icons/io";
import { ImImages } from "react-icons/im";
import GalleryModal from "../shop-setup/product/add/GalleryModal";
import { MdOutlineCancel } from "react-icons/md";

const AdminUserAdd = () => {
  const [data, setData] = useState<any>();

  const [isLoading, setIsLoading] = useState<any>(null);
  const [open1, setOpen1] = useState<any>(null);
  const [open2, setOpen2] = useState<any>(null);

  const { userDetails } = useSelector((state: any) => state.user);

  const dispatch = useDispatch();

  useEffect(() => {
    get();
  }, []);

  const get = async () => {
    setIsLoading(true);

    try {
      const res = await axiosInstance.get("/user/shoptypes", {});

      setData(res?.data?.data || []);
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      // Handle error
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
    try {
      setIsLoading(true);

      let imageFilename = values.image;

      // 👉 CASE 1: Image uploaded via SingleFileUploader (File object)
      if (values.image && typeof values.image[0] === "object") {
        const formData = new FormData();
        formData.append("images", values.image[0]);

        const uploadRes = await uploadImages(formData);
        imageFilename = uploadRes?.data?.data?.[0];
      }

      // 👉 CASE 2: Image chosen from gallery (already a string)
      // Nothing to do — we just use values.image as is.

      const { image, ...rest } = values;

      // Prepare form data for registration
      const form_values = {
        ...rest,
        avatar: imageFilename, // Final image name or path
        shopType: values.shopType?.value,
      };

      const res = await axiosInstance.post("/auth/register", form_values);

      if (res?.data?.success) {
        Helper.res(res);
      }
    } catch (error: any) {
      Helper.res(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Fragment>
      <div className="container my-[40px]">
        <h5 className="mb-3">User Information</h5>

        <Formik
          enableReinitialize
          initialValues={{
            name: userDetails?.name || "",
            password: userDetails?.password || "",
            phone: userDetails?.phone || "",
            shopType:
              userDetails?.shopType?.type && userDetails?.shopType?._id
                ? { label: userDetails?.shopType?.type, value: userDetails?.shopType?._id }
                : null,
            // image: userDetails?.image || [],
          }}
          validationSchema={ValidationSchema.user}
          onSubmit={handleSubmit}
        >
          {({ values, setFieldValue, errors, touched, submitCount, handleSubmit: formikSubmit }: any): any => (
            <Form onSubmit={formikSubmit}>
              {console.log("errors::", errors)}
              <div className="bg-base-100 relative rounded-md p-5 md:p-10">
                {/* <div className="avatar absolute -top-16 left-[42%]">
                  {values.image && values.image.length > 0 && (
                    <MdOutlineCancel size={32} className="text-error absolute top-1 -right-4" onClick={() => setFieldValue("image", [])} />
                  )}
                  {values.image && values.image.length > 0 ? (
                    // When image is a File object
                    typeof values.image[0] === "object" ? (
                      <div className="ring-primary ring-offset-base-100 w-32 overflow-hidden rounded-full ring-2 ring-offset-2">
                        <img src={URL.createObjectURL(values.image[0])} alt="preview" className="h-32 w-32 rounded-full object-cover" />
                      </div>
                    ) : (
                      // When image is already uploaded (string from Cloudinary)
                      <div className="ring-primary ring-offset-base-100 w-32 overflow-hidden rounded-full ring-2 ring-offset-2">
                        <img
                          src={`https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_NAME}/image/upload/${values.image}`}
                          alt="uploaded"
                          className="h-32 w-32 rounded-full object-cover"
                        />
                      </div>
                    )
                  ) : (
                    // Default placeholder
                    <div
                      className={`${submitCount > 0 && errors?.image ? "border-error" : "border-dark-2"} relative w-32 cursor-pointer rounded-full border-2 bg-black/40`}
                      onClick={() => setOpen1(true)}
                    >
                      <div className="flex h-full items-center justify-center">
                        <ImImages size={35} className={`${submitCount > 0 && errors?.image ? "text-error" : ""}`} />
                      </div>
                    </div>
                  )}
                </div> */}

                <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 md:gap-10">
                  <Field
                    label="Shop Name*"
                    value={values.name}
                    name={`name`}
                    type="text"
                    component={CustomInput}
                    placeholder={`e.g Cheezious`}
                    icon={<FaShop className="text-lg" />}
                  />

                  <Field
                    component={CustomSelect}
                    label={"Shop Type*"}
                    value={values.shopType}
                    name={`shopType`}
                    placeholder="e.g Restaurant"
                    icon={<FaRegBuilding className="text-lg" />}
                    options={
                      data?.shoptypes && data?.shoptypes?.length > 0
                        ? data?.shoptypes.map((item: any) => ({
                            label: item.type,
                            value: item._id,
                          }))
                        : []
                    }
                  />

                  <Field
                    label="Phone Number*"
                    value={values.phone}
                    name={`phone`}
                    type="text"
                    component={CustomInput}
                    placeholder={`e.g 3135648763`}
                    icon={"+92"}
                  />
                  {console.log("userDetailsuserDetailsuserDetails::", userDetails)}
                  {Object.keys(userDetails).length === 0 && (
                    <Field
                      label="Password*"
                      value={values.password}
                      name={`password`}
                      type="text"
                      component={CustomInput}
                      placeholder={`e.g xxxxxxxx`}
                      icon={<IoMdLock className="text-lg" />}
                    />
                  )}
                </div>
              </div>

              {console.log("object", errors)}

              <div className="mt-7 flex flex-col items-center justify-center gap-4">
                {submitCount > 0 && Object.keys(errors).length > 0 && (
                  <>
                    <p className="text-error text-center">Form submition error occur, please fill the form with correct details.</p>
                    <div className="text-error text-[12px]">{errors?.image}</div>
                  </>
                )}

                <button type="submit" disabled={isLoading} className="btn btn-primary">
                  Submit {isLoading && <span className="loading loading-spinner text-primary"></span>}
                </button>
              </div>

              {open2 && <GalleryModal open={open2} setOpen={setOpen2} setFieldValue={setFieldValue} imageValue={values.image} />}

              {open1 && (
                <dialog id="add-new-category" className={`modal ${open1 ? "modal-open" : "modal-close"}`}>
                  <div className="modal-box md:min-w-[800px]">
                    <button type="button" className="btn btn-circle btn-ghost btn-sm absolute top-2 right-2" onClick={() => setOpen1(false)}>
                      ✕
                    </button>

                    <div className="border-b-base-content-20 border-b pb-3">
                      <h3 className="flex items-center gap-2 text-lg font-bold">Add Avatar</h3>
                      <p className="">
                        Add avatar from below or{" "}
                        <span
                          className="text-primary"
                          onClick={() => {
                            setOpen1(false);
                            setOpen2(true);
                          }}
                        >
                          Choose from gallery
                        </span>
                        .
                      </p>
                    </div>

                    <div className="bg-base-100 rounded-md p-5 max-xl:col-span-2 md:p-10">
                      <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">
                        <div className="col-span-2">
                          <SingleFileUploader
                            files={values.image}
                            name="image"
                            setFieldValue={setFieldValue}
                            error={submitCount > 0 ? errors.image : ""}
                            submitCount={submitCount}
                          />
                        </div>
                      </div>
                    </div>

                    {/* <div className="mt-7 flex justify-end">
            <button type="button" className="btn btn-primary" disabled={isDeleteLoading || isLoading} onClick={handleSubmit}>
              Submit {(isDeleteLoading || isLoading) && <Spinner colorClass="!text-neutral" />}
            </button>
          </div> */}
                  </div>
                </dialog>
              )}
            </Form>
          )}
        </Formik>

        {userDetails && (
          <div className="container my-[40px]">
            <h5 className="mb-3">Change Password</h5>

            <Formik
              initialValues={{
                password: "",
                confirmPassword: "",
              }}
              validationSchema={ValidationSchema.changePassword}
              onSubmit={async (values, { resetForm }) => {
                try {
                  setIsLoading(true);
                  const res = await axiosInstance.put(`/auth/admin/change-password`, {
                    password: values.password,
                    targetUserId: userDetails?._id,
                  });

                  if (res?.data?.success) {
                    Helper.res(res);
                    resetForm();
                  } else {
                    Helper.res(res);
                  }
                } catch (error) {
                  Helper.res(error);
                } finally {
                  setIsLoading(false);
                }
              }}
            >
              {({ values, errors, touched, handleSubmit, submitCount }) => (
                <Form onSubmit={handleSubmit}>
                  <div className="bg-base-100 relative rounded-md p-5 md:p-10">
                    <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 md:gap-10">
                      <Field
                        label="New Password*"
                        name="password"
                        type="password"
                        component={CustomInput}
                        placeholder="Enter new password"
                        icon={<IoMdLock className="text-lg" />}
                      />

                      <Field
                        label="Confirm Password*"
                        name="confirmPassword"
                        type="password"
                        component={CustomInput}
                        placeholder="Re-enter password"
                        icon={<IoMdLock className="text-lg" />}
                      />
                    </div>
                  </div>

                  <div className="mt-7 flex flex-col items-center justify-center gap-4">
                    {submitCount > 0 && Object.keys(errors).length > 0 && (
                      <p className="text-error text-center">Please fix the errors before submitting.</p>
                    )}
                    <button type="submit" disabled={isLoading} className="btn btn-primary">
                      Update Password {isLoading && <span className="loading loading-spinner"></span>}
                    </button>
                  </div>
                </Form>
              )}
            </Formik>
          </div>
        )}
      </div>
    </Fragment>
  );
};

export default AdminUserAdd;
