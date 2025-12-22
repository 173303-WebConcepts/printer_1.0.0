import { CustomSelect } from "@/widgets/CustomSelect";
import { Field, Form, Formik } from "formik";
import React from "react";
import { CiUser } from "react-icons/ci";
import { MdEmail } from "react-icons/md";

const Filters = ({ get }: any) => {
  const handleSubmit = async (values: any) => {
    const filters: any = {};

    if (values?.isActive) filters.isActive = values.isActive?.value;

    get(filters);
  };

  return (
    <div className="bg-base-100 mb-10 w-full rounded-md px-5 py-5 shadow-lg md:px-7">
      <Formik
        initialValues={{
          role: "",
          isActive: "",
        }}
        onSubmit={handleSubmit}
      >
        {({ values, resetForm, setFieldValue, handleSubmit: formikSubmit }): any => (
          <Form className="space-y-10" onSubmit={formikSubmit}>
            {/* Personal info Collapse */}
            <div className={``}>
              <h3 className="mb-5 capitalize">Filters</h3>
              <div className="">
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  <div className="w-full">
                    <Field
                      value={values.isActive}
                      label="Is Active"
                      name={`isActive`}
                      component={CustomSelect}
                      placeholder="isActive"
                      options={[
                        { label: "Yes", value: true },
                        { label: "No", value: false },
                      ]}
                      icon={<CiUser />}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-7 flex justify-end gap-5">
              <button className="btn btn-primary" type="submit">
                Submit
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default Filters;
