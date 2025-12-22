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
import { FaClock } from "react-icons/fa";
import { axiosInstance } from "@/utils/axios";
import SingleFileUploader from "./SingleFileUploader";

// import ContentEditor from "./ContentEditor";
const ContentEditor = dynamic(() => import("./ContentEditor"), { ssr: false });

const AdminProjectAdd = () => {
  // const [descriptionContent, setDescriptionContent] = useState<any>(EditorState.createWithContent(convertFromRaw(defaultContent)));
  const [descriptionContent, setDescriptionContent] = useState<any>(null);

  const [data, setData] = useState<any>();
  // const [descriptionContent, setDescriptionContent] = useState(() => EditorState.createEmpty());

  const [editorError, setEditorError] = useState(false);
  const [isLoading, setIsLoading] = useState<any>(null);

  const dispatch = useDispatch();

  useEffect(() => {
    // setDescriptionContent(EditorState.createWithContent(convertFromRaw(defaultContent)));

    const rawContent = convertFromRaw(defaultContent);
    const initialState = EditorState.createWithContent(rawContent);
    setDescriptionContent(initialState);

    get();
  }, []);

  const get = async () => {
    try {
      const res = await axiosInstance.get("/category/get-IBT");

      setData(res?.data?.data || []);
    } catch (error) {
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
    let response: any;

    try {
      setIsLoading(true);
      // Extract plain text and count characters
      // const characterCount = Helper.getCharacterCount(descriptionContent);
      // if (characterCount < MIN_CART_LIMIT || characterCount > MAX_CART_LIMIT) {
      //   setEditorError(true);
      //   return;
      // }

      const formData: any = new FormData();
      values.images.forEach((item: any) => formData.append("images", item));
      response = await uploadImages(formData);

      if (response?.data?.success) {
        const images = response?.data?.data;
        // Convert editor content to raw JSON
        // const rawDescription = convertToRaw(descriptionContent.getCurrentContent());
        // const res = await createPubgProduct({ ...formattedValues, images, descriptionContent: rawDescription }).unwrap();



        const form_values = {
          ...values,
          problems: values?.problems?.[0]?.trim() ? values.problems : [],
          solutions: values?.solutions?.[0]?.trim() ? values.solutions : [],
          businessModel: values?.businessModel?.value,
          technology: values?.technology?.value,
          industry: values?.industry?.value,
          thumbnail: images[0],
        };

        const res = await axiosInstance.post("/project/create", form_values);

        if (res?.data?.success) {
          return Toast.success();
        }
      }
    } catch (error: any) {

      return Toast.error(error?.data?.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Fragment>
      <div className="container my-[40px]">
        <h5 className="mb-3">Project Information</h5>

        <Formik enableReinitialize initialValues={InitialValues.project} validationSchema={ValidationSchema.project} onSubmit={handleSubmit}>
          {({ values, setFieldValue, errors, touched, submitCount, handleSubmit: formikSubmit }): any => (
            <Form onSubmit={formikSubmit}>
              <div className="bg-base-100 rounded-md p-5 md:p-10">
                <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 md:gap-10">
                  <Field
                    label="Title*"
                    value={values.title}
                    name={`title`}
                    type="text"
                    component={CustomInput}
                    placeholder={`e.g School children traveling site`}
                  />

                  <Field
                    component={CustomSelect}
                    label={"Industry*"}
                    value={values.industry}
                    name={`industry`}
                    placeholder="e.g Health"
                    options={
                      data?.industries && data?.industries?.length > 0
                        ? data?.industries.map((item: any) => ({
                            label: item.name,
                            value: item._id,
                          }))
                        : []
                    }
                  />

                  <Field
                    component={CustomSelect}
                    label={"Technology*"}
                    value={values.technology}
                    name={`technology`}
                    placeholder="e.g Health"
                    options={
                      data?.technologies && data?.technologies?.length > 0
                        ? data?.technologies.map((item: any) => ({
                            label: item.name,
                            value: item._id,
                          }))
                        : []
                    }
                  />
                  <Field
                    component={CustomSelect}
                    label={"Business Model*"}
                    value={values.businessModel}
                    name={`businessModel`}
                    placeholder="e.g Health"
                    options={
                      data?.businessModels && data?.businessModels?.length > 0
                        ? data?.businessModels.map((item: any) => ({
                            label: item.name,
                            value: item._id,
                          }))
                        : []
                    }
                  />

                  <div className="md:col-span-2">
                    <Field
                      label="Description*"
                      value={values.description}
                      name={`description`}
                      type="textarea"
                      component={CustomTextarea}
                      placeholder={`e.g School children traveling site that help to safely...`}
                    />
                  </div>

                  <div>
                    <span className="mb-1 block font-medium capitalize">Is Clone*</span>

                    <div className="mt-3 flex gap-10">
                      <div>
                        <Field label="Yes" value={true} name={`isClone`} component={CustomRadio} defaultChecked={true} />
                      </div>
                      <div>
                        <Field label="No" value={true} name={`isClone`} component={CustomRadio} />
                      </div>
                    </div>
                  </div>

                  <div>
                    <span className="mb-1 block font-medium capitalize">Status*</span>

                    <div className="mt-3 flex flex-wrap gap-5">
                      <div>
                        <Field label="Published" value={"published"} name={`status`} component={CustomRadio} defaultChecked={true} />
                      </div>
                      <div>
                        <Field label="Draft" value={"draft"} name={`status`} component={CustomRadio} />
                      </div>
                      <div>
                        <Field label="In-Active" value={"inActive"} name={`status`} component={CustomRadio} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div className="bg-base-100 col-span-2 rounded-md p-5 md:p-10">
                  <div className="space-y-10">
                    <FieldArray
                      name="budget"
                      render={(arrayHelpers) => (
                        <Fragment>
                          <div className="flex justify-between border-b border-b-gray-700 pb-3">
                            <p className="text-lg font-medium">Budget ({values.budget.length})</p>

                            <button
                              type="button"
                              className="btn btn-neutral btn-sm min-w-24"
                              onClick={() => arrayHelpers.insert(values.budget.length, { description: "", duration: "", amount: "" })}
                            >
                              Add another
                            </button>
                          </div>

                          {values.budget &&
                            values.budget.length > 0 &&
                            values.budget.map((workExp, index) => (
                              <div key={index}>
                                <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                                  <div className="">
                                    <Field
                                      name={`budget[${index}].description`}
                                      component={CustomInput}
                                      label="Description"
                                      placeholder="e.g Ui/Ux Design"
                                    />
                                  </div>
                                  <div className="">
                                    <Field
                                      name={`budget[${index}].duration`}
                                      component={CustomInput}
                                      label="Duration"
                                      placeholder="e.g Ui/Ux Design"
                                    />
                                  </div>
                                  <div className="">
                                    <Field name={`budget[${index}].amount`} component={CustomInput} label="Amount" placeholder="e.g Ui/Ux Design" />
                                  </div>
                                </div>

                                <div className="flex justify-end">
                                  {index > 0 && (
                                    <button type="button" className="btn btn-error btn-sm" onClick={() => arrayHelpers.remove(index)}>
                                      Remove
                                    </button>
                                  )}
                                </div>
                              </div>
                            ))}
                        </Fragment>
                      )}
                    />
                  </div>
                </div>

                <div className="bg-base-100 rounded-md p-5 max-xl:col-span-2 md:p-10">
                  <div className="space-y-10">
                    <FieldArray
                      name="problems"
                      render={(arrayHelpers) => (
                        <Fragment>
                          <div className="flex justify-between border-b border-b-gray-700 pb-3">
                            <p className="text-lg font-medium">Problems ({values.problems.length})</p>

                            <button
                              type="button"
                              className="btn btn-neutral btn-sm min-w-24"
                              onClick={() => arrayHelpers.insert(values.problems.length, "")}
                            >
                              Add another
                            </button>
                          </div>
                          {values.problems &&
                            values.problems.length > 0 &&
                            values.problems.map((workExp, index) => (
                              <div className="" key={index}>
                                <div className="">
                                  <Field
                                    name={`problems[${index}]`}
                                    component={CustomTextarea}
                                    label="Problem"
                                    placeholder="e.g School childrens pick & drop..."
                                  />
                                </div>
                                <div className="mt-1 flex justify-end">
                                  {index > 0 && (
                                    <button type="button" className="btn btn-error btn-sm" onClick={() => arrayHelpers.remove(index)}>
                                      Remove
                                    </button>
                                  )}
                                </div>
                              </div>
                            ))}
                        </Fragment>
                      )}
                    />
                  </div>
                </div>

                <div className="bg-base-100 rounded-md p-5 max-xl:col-span-2 md:p-10">
                  <div className="space-y-10">
                    <FieldArray
                      name="solutions"
                      render={(arrayHelpers) => (
                        <Fragment>
                          <div className="flex justify-between border-b border-b-gray-700 pb-3">
                            <p className="text-lg font-medium capitalize">Solutions ({values.solutions.length})</p>

                            <button
                              type="button"
                              className="btn btn-neutral btn-sm min-w-24"
                              onClick={() => arrayHelpers.insert(values.solutions.length, "")}
                            >
                              Add another
                            </button>
                          </div>
                          {values.solutions &&
                            values.solutions.length > 0 &&
                            values.solutions.map((workExp, index) => (
                              <div className="" key={index}>
                                <div className="">
                                  <Field
                                    name={`solutions[${index}]`}
                                    component={CustomTextarea}
                                    label="Soution"
                                    placeholder="e.g School childrens pick & drop..."
                                  />
                                </div>
                                <div className="mt-1 flex justify-end">
                                  {index > 0 && (
                                    <button type="button" className="btn btn-error btn-sm" onClick={() => arrayHelpers.remove(index)}>
                                      Remove
                                    </button>
                                  )}
                                </div>
                              </div>
                            ))}
                        </Fragment>
                      )}
                    />
                  </div>
                </div>

                <div className="bg-base-100 rounded-md p-5 max-xl:col-span-2 md:p-10">
                  <div className="space-y-10">
                    <FieldArray
                      name="targetAudience"
                      render={(arrayHelpers) => (
                        <Fragment>
                          <div className="flex justify-between border-b border-b-gray-700 pb-3">
                            <p className="text-lg font-medium capitalize">Target Audience ({values.targetAudience.length})</p>

                            <button
                              type="button"
                              className="btn btn-neutral btn-sm min-w-24"
                              onClick={() => arrayHelpers.insert(values.targetAudience.length, "")}
                            >
                              Add another
                            </button>
                          </div>
                          {values.targetAudience &&
                            values.targetAudience.length > 0 &&
                            values.targetAudience.map((workExp, index) => (
                              <div className="" key={index}>
                                <div className="">
                                  <Field name={`targetAudience[${index}]`} component={CustomInput} label="Audience" placeholder="e.g Travelers" />
                                </div>
                                <div className="mt-1 flex justify-end">
                                  {index > 0 && (
                                    <button type="button" className="btn btn-error btn-sm" onClick={() => arrayHelpers.remove(index)}>
                                      Remove
                                    </button>
                                  )}
                                </div>
                              </div>
                            ))}
                        </Fragment>
                      )}
                    />
                  </div>
                </div>

                <div className="bg-base-100 rounded-md p-5 max-xl:col-span-2 md:p-10">
                  <div className="space-y-10">
                    <FieldArray
                      name="competitors"
                      render={(arrayHelpers) => (
                        <Fragment>
                          <div className="flex justify-between border-b border-b-gray-700 pb-3">
                            <p className="text-lg font-medium capitalize">Competitors ({values.competitors.length})</p>

                            <button
                              type="button"
                              className="btn btn-neutral btn-sm min-w-24"
                              onClick={() => arrayHelpers.insert(values.competitors.length, "")}
                            >
                              Add another
                            </button>
                          </div>
                          {values.competitors &&
                            values.competitors.length > 0 &&
                            values.competitors.map((workExp, index) => (
                              <div className="" key={index}>
                                <div className="">
                                  <Field
                                    name={`competitors[${index}]`}
                                    component={CustomInput}
                                    label="Website Link"
                                    placeholder="e.g http://google.com"
                                  />
                                </div>
                                <div className="mt-1 flex justify-end">
                                  {index > 0 && (
                                    <button type="button" className="btn btn-error btn-sm" onClick={() => arrayHelpers.remove(index)}>
                                      Remove
                                    </button>
                                  )}
                                </div>
                              </div>
                            ))}
                        </Fragment>
                      )}
                    />
                  </div>
                </div>

                <div className="bg-base-100 rounded-md p-5 max-xl:col-span-2 md:p-10">
                  <div className="space-y-10">
                    <FieldArray
                      name="features"
                      render={(arrayHelpers) => (
                        <Fragment>
                          <div className="flex justify-between border-b border-b-gray-700 pb-3">
                            <p className="text-lg font-medium capitalize">Features ({values.features.length})</p>

                            <button
                              type="button"
                              className="btn btn-neutral btn-sm min-w-24"
                              onClick={() => arrayHelpers.insert(values.features.length, "")}
                            >
                              Add another
                            </button>
                          </div>
                          {values.features &&
                            values.features.length > 0 &&
                            values.features.map((workExp, index) => (
                              <div className="" key={index}>
                                <div className="">
                                  <Field
                                    name={`features[${index}]`}
                                    component={CustomTextarea}
                                    label="Feature"
                                    placeholder="e.g Auto login to site..."
                                  />
                                </div>
                                <div className="mt-1 flex justify-end">
                                  {index > 0 && (
                                    <button type="button" className="btn btn-error btn-sm" onClick={() => arrayHelpers.remove(index)}>
                                      Remove
                                    </button>
                                  )}
                                </div>
                              </div>
                            ))}
                        </Fragment>
                      )}
                    />
                  </div>
                </div>

                <div className="bg-base-100 rounded-md p-5 max-xl:col-span-2 md:p-10">
                  <h5>Upload Thumbnail</h5>

                  <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">
                    <div className="col-span-2">
                      <SingleFileUploader
                        files={values.images}
                        name="images"
                        setFieldValue={setFieldValue}
                        error={submitCount > 0 ? errors.images : ""}
                        submitCount={submitCount}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* <div className="bg-base-200 mt-5 rounded-md p-5 md:p-10">
                {descriptionContent && (
                  <ContentEditor descriptionContent={descriptionContent} setDescriptionContent={setDescriptionContent} submitCount={submitCount} />
                )}
              </div> */}

              <div className="mt-7 flex flex-col items-center justify-center gap-4">
                {submitCount > 0 && (Object.keys(errors).length > 0 || editorError) && (
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

export default AdminProjectAdd;
