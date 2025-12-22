"use client";
import { axiosInstance } from "@/utils/axios";
import { Constants } from "@/utils/Constants";
import { InitialValues } from "@/utils/formik/InitalValues";
import CustomInput from "@/widgets/CustomInput";
import CustomRadio from "@/widgets/CustomRadio";
import { CustomSelect } from "@/widgets/CustomSelect";
import Toast from "@/widgets/CustomToast";
import { Field, Form, Formik } from "formik";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import AddNewCategoryModal from "./AddNewCategoryModal";
import { useSelector } from "react-redux";
import AddNewBrandModal from "./AddNewBrandModal";
import { Helper } from "@/utils/Helper";
import { ImImages } from "react-icons/im";
import GalleryModal from "./GalleryModal";
import { ValidationSchema } from "@/utils/formik/ValidationSchema";
import SingleFileUploader from "../../../add/SingleFileUploader";

const ProductAdd = () => {
  const [isLoading, setIsLoading] = useState<any>(null);
  const [data, setData] = useState<any>();
  const [open, setOpen] = useState<any>(false);
  const [open1, setOpen1] = useState<any>(false);
  const [open2, setOpen2] = useState<any>(false);
  const [open3, setOpen3] = useState<any>(false);

  const [categoriesData, setCategoriesData] = useState<any>([]);
  const [brandsData, setBrandsData] = useState<any>([]);

  const { userId } = useParams();

  const { user } = useSelector((State: any) => State.user);
  const { itemDetails } = useSelector((State: any) => State.common);

  useEffect(() => {
    get({ page: 1, pageSize: 100 });
  }, []);

  const get = async ({ page, pageSize, ...restFilters }: any) => {
    setIsLoading(true);

    // Clean up filters
    const cleanedFilters = Object.fromEntries(Object.entries(restFilters).filter(([_, value]) => value !== undefined && value !== ""));

    try {
      const params = { userId: userId?.[0], page, pageSize, ...cleanedFilters };

      // Fetch in parallel
      const [resBrand, resCate] = await Promise.all([
        axiosInstance.get("/category/user-brands", { params }),
        axiosInstance.get("/category/user-categories", { params }),
      ]);

      // Update state from both results
      setCategoriesData(resCate?.data?.data || []);
      setBrandsData(resBrand?.data?.data || []); // assuming you want to set brands too
    } catch (error) {
      console.error(error);
      // Handle error here
    } finally {
      setIsLoading(false);
    }
  };

  const getCategories = async ({ page, pageSize, ...restFilters }: any) => {
    setIsLoading(true);
    // Remove undefined or empty string values from filters
    const cleanedFilters = Object.fromEntries(Object.entries(restFilters).filter(([key, value]) => key && value !== undefined && value !== ""));

    try {
      const res = await axiosInstance.get("/category/user-categories", {
        params: { userId: userId && userId[0], page, pageSize, ...cleanedFilters },
      });

      setCategoriesData(res?.data?.data || []);
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      // Handle error
    }
  };
  const getBrands = async ({ page, pageSize, ...restFilters }: any) => {
    setIsLoading(true);
    // Remove undefined or empty string values from filters
    const cleanedFilters = Object.fromEntries(Object.entries(restFilters).filter(([key, value]) => key && value !== undefined && value !== ""));

    try {
      const res = await axiosInstance.get("/category/user-brands", {
        params: { userId: userId && userId[0], page, pageSize, ...cleanedFilters },
      });

      setBrandsData(res?.data?.data || []);
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

      // Prepare form data for registration
      const form_values = {
        ...values,
        userIdByAdmin: userId && userId[0],
        brandId: values.brandId.value,
        categoryId: values.categoryId.value,
        unit: values.unit.value,
        image: imageFilename, // Final image name or path
        shopType: values.shopType?.value,
      };

      let res;

      if (!itemDetails) {
        res = await axiosInstance.post("/product/create", form_values);
      } else {
        res = await axiosInstance.put(`/product/update/${itemDetails?._id}`, form_values);
      }

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
    <div className="container my-[40px]">
      <h5 className="mb-3 capitalize">
        Add Product <span className="text-primary">{userId && `(${user?.name})`}</span>
      </h5>

      <Formik
        enableReinitialize
        initialValues={
          itemDetails
            ? {
                name: itemDetails.name,
                unit: { label: itemDetails.unit, value: itemDetails.unit },
                purchasePrice: itemDetails.purchasePrice,
                sellingPrice: itemDetails.sellingPrice,
                tax: itemDetails.tax,
                stock: itemDetails.stock,
                isActive: itemDetails.isActive,
                categoryId: itemDetails.categoryId ? { label: itemDetails.categoryId.name, value: itemDetails.categoryId._id } : "",
                brandId: itemDetails.brandId ? { label: itemDetails.brandId.name, value: itemDetails.brandId._id } : "",
                image: itemDetails.image,
              }
            : InitialValues.shopSetup
        }
        validationSchema={ValidationSchema.addProduct}
        onSubmit={handleSubmit}
      >
        {({ values, setFieldValue, errors, touched, submitCount, handleSubmit: formikSubmit }): any => (
          <Form onSubmit={formikSubmit}>
            <div className="bg-base-100 relative rounded-md p-5 md:p-10">
              <div className="avatar absolute -top-16 left-[42%]" onClick={() => setOpen1(true)}>
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
                  >
                    <div className="flex h-full items-center justify-center">
                      <ImImages size={35} className={`${submitCount > 0 && errors?.image ? "text-error" : ""}`} />
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 md:gap-10">
                <Field label="Product Name*" value={values.name} name={`name`} type="text" component={CustomInput} placeholder={`e.g Spicy pizza`} />

                <Field
                  component={CustomSelect}
                  label={"Unit*"}
                  value={values.unit}
                  name={`unit`}
                  placeholder="e.g Pieces"
                  options={
                    Constants?.unitConstant && Constants?.unitConstant?.length > 0
                      ? Constants?.unitConstant.map((item: any) => ({
                          label: item,
                          value: item,
                        }))
                      : []
                  }
                />

                <Field
                  label="Purchase Price*"
                  value={values.purchasePrice}
                  name={`purchasePrice`}
                  type="number"
                  component={CustomInput}
                  placeholder={`e.g 800 rupees`}
                />

                <Field
                  label="Selling Price*"
                  value={values.sellingPrice}
                  name={`sellingPrice`}
                  type="number"
                  component={CustomInput}
                  placeholder={`e.g 1000 rupees`}
                />

                <Field label="Tax (%)" value={values.tax} name={`tax`} type="number" component={CustomInput} placeholder={`e.g 5%`} />

                <Field label="Stock*" value={values.stock} name={`stock`} type="number" component={CustomInput} placeholder={`e.g 28`} />

                <Field
                  component={CustomSelect}
                  label={"Category"}
                  value={values.categoryId}
                  name={`categoryId`}
                  placeholder="e.g Pizza"
                  options={
                    categoriesData.categories && categoriesData.categories?.length > 0
                      ? categoriesData.categories.map((item: any) => ({
                          label: item.name,
                          value: item._id,
                        }))
                      : []
                  }
                  add={
                    <button type="button" className="btn btn-xs" onClick={() => setOpen(true)}>
                      Add New
                    </button>
                  }
                />
                <Field
                  component={CustomSelect}
                  label={"Brand"}
                  value={values.brandId}
                  name={`brandId`}
                  placeholder="e.g iPhone"
                  options={
                    brandsData.brands && brandsData.brands?.length > 0
                      ? brandsData.brands.map((item: any) => ({
                          label: item.name,
                          value: item._id,
                        }))
                      : []
                  }
                  add={
                    <button type="button" className="btn btn-xs" onClick={() => setOpen3(true)}>
                      Add New
                    </button>
                  }
                />

                <div>
                  <span className="mb-1 block font-medium capitalize">Is Active*</span>

                  <div className="mt-3 flex gap-10">
                    <div>
                      <Field label="Yes" value={true} name={`isActive`} component={CustomRadio} />
                    </div>
                    <div>
                      <Field label="No" value={false} name={`isActive`} component={CustomRadio} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-7 flex flex-col items-center justify-center gap-4">
              {submitCount > 0 && Object.keys(errors).length > 0 && (
                <>
                  <p className="text-error text-center">Form submition error occur, please fill the form with correct details.</p>
                  {errors?.image && <p className="text-error text-center">{errors?.image}</p>}
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

      {open && <AddNewCategoryModal open={open} setOpen={setOpen} refetchData={() => getCategories({ page: 1, pageSize: 100 })} />}
      {open3 && <AddNewBrandModal open={open3} setOpen={setOpen3} refetchData={() => getBrands({ page: 1, pageSize: 100 })} />}
    </div>
  );
};

export default ProductAdd;
