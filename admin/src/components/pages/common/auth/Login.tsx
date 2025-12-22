"use client";
import { useState } from "react";
import { MdLockOpen, MdOutlineEmail } from "react-icons/md";
import ForgotPassword from "./ForgotPassword";
import { Field, Form, Formik } from "formik";
import { ValidationSchema } from "@/utils/formik/ValidationSchema";
import CustomInput from "@/widgets/CustomInput";
import { InitialValues } from "@/utils/formik/InitalValues";
import { loginUser } from "@/redux/slices/authSlice";
import Toast from "@/widgets/CustomToast";
import { usePathname } from "next/navigation";
import { useDispatch } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import { useSelector } from "react-redux";
import { useRouter } from "nextjs-toploader/app";

const Login: React.FC<any> = ({ open, setOpen, setRegister }) => {
  // State to manage the visibility of the ForgotPassword modal
  const [forgotPassword, setForgotPassword] = useState<boolean>(false);
  const router = useRouter();
  const pathname = usePathname();

  const dispatch = useDispatch<AppDispatch>();
  const { loading } = useSelector((state: RootState) => state.auth);

  const handleSubmit = (values: any) => {
    const { confirmPassword, ...formValues } = values;

    dispatch(loginUser({ ...formValues }))
      .then((res: any) => {
        if (res?.payload?.response?.data?.success == false) {
          // setOpen(false);
          return Toast.error(res?.payload?.response?.data?.message);
        } else if (res?.payload?.success) {
          // setOpen(false);
          Toast.success(res?.payload?.message);
          return router.push("/admin/dashboard");
        }
      })
      .catch((error: any) => {
        return Toast.error("Error occur");
      });
  };

  return (
    <>
      {/* Conditional class to open/close the modal based on `open` prop */}
      <dialog id="login" className={`modal ${open ? "modal-open fixed inset-0 !z-[999999] min-h-screen" : ""}`}>
        <div className="modal-box">
          <Formik validationSchema={ValidationSchema.login} initialValues={InitialValues.login} onSubmit={handleSubmit}>
            {({ values, resetForm, setFieldValue, }) => (
              <Form>
                {/* Close button for the modal */}
                {/* <button className="btn btn-circle btn-ghost btn-sm absolute top-2 right-2" type="button" onClick={() => setOpen(false)}>
                  ✕
                </button> */}

                {/* Modal title and description */}
                <h4 className="text-center capitalize">Welcome Back</h4>
                <p className="mt-1 text-center text-slate-400">Please enter your details to login</p>

                {/* Input fields for user details */}
                <div className="mt-5 grid grid-cols-1 gap-5">
                  <div className="w-full">
                    <Field value={values.phone} name={`phone`} type="text" component={CustomInput} placeholder="Phone*" icon={"+92"} />
                  </div>
                  <div className="w-full">
                    <Field
                      value={values.password}
                      name={`password`}
                      type="password"
                      component={CustomInput}
                      placeholder="Password*"
                      icon={<MdLockOpen />}
                    />
                  </div>
                </div>

                {/* Forgot password link */}
                <div className="flex justify-end">
                  <span
                    className="text-primary cursor-pointer"
                    onClick={() => {
                      setOpen(false);
                      setForgotPassword(true);
                    }}
                  >
                    Forgot Password?
                  </span>
                </div>

                <div className="mt-10 flex justify-center">
                  <button type="submit" disabled={loading === "pending"} className="btn btn-primary">
                    Login {loading === "pending" && <span className="loading loading-spinner"></span>}
                  </button>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      </dialog>

      {/* ForgotPassword component */}
      <ForgotPassword open={forgotPassword} setOpen={setForgotPassword} setLogin={setOpen} />
    </>
  );
};

export default Login;
