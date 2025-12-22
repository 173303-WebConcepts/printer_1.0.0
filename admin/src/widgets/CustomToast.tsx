import { toast, ToastOptions } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const baseToastClass = "rounded-md shadow-md bg-primary px-4 py-3 text-sm transition-all duration-300";
const lightToastClass = "bg-primary text-base-content";
const darkToastClass = "bg-primary text-neutral-content";

const getToastClass = () => {
  if (typeof window === "undefined") return baseToastClass;
  const theme = document.documentElement.getAttribute("data-theme");

  return `${baseToastClass} ${theme === "dark" ? darkToastClass : lightToastClass}`;
};

const defaultOptions: ToastOptions = {
  position: "top-right",
  autoClose: 5000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  progress: undefined,
};

const Toast = {
  success: (message: string = "Success!", options?: ToastOptions) => {
    toast.success(message, {
      ...defaultOptions,
      ...options,
      className: getToastClass(),
    });
  },
  error: (message: string = "Failed!", options?: ToastOptions) => {
    toast.error(message, {
      ...defaultOptions,
      ...options,
      className: getToastClass(),
    });
  },
  warn: (message: string, options?: ToastOptions) => {
    toast.warn(message, {
      ...defaultOptions,
      ...options,
      className: getToastClass(),
    });
  },
};

export default Toast;
