import { ErrorMessage, FieldProps, getIn } from "formik";
import { ReactNode } from "react";
import { PiLineVerticalThin } from "react-icons/pi";

interface CustomInputProps extends FieldProps {
  placeholder?: string;
  label?: string;
  icon?: ReactNode;
  iconPosition?: "left" | "right";
  className?: string;
  type?: "text" | "number";
  disabled: boolean;
}

const CustomInput = ({
  field, // { name, value, onChange, onBlur }
  placeholder = "Enter your text",
  icon,
  type = "text",
  iconPosition = "left",
  className = "",
  label = "",
  form,
  disabled = false,
}: CustomInputProps) => {
  const name = field?.name ?? "";
  const errors = form?.errors ?? {};
  const submitCount = form?.submitCount ?? 0;

  const error = getIn(errors, name);

  console.log("object",errors, error, name)

  return (
    <div>
      {label && <span className="mb-1 block font-medium">{label}</span>}
      <label
        className={`input input-bordered input-md mb-1 flex w-full items-center gap-2 ${className} ${submitCount > 0 && error ? "!border-error focus-within:!border-error" : ""}`}
      >
        {icon && iconPosition === "left" && (
          <div className="flex items-center gap-0.5">
            {icon} <PiLineVerticalThin />
          </div>
        )}
        <input type={type} className="grow" placeholder={placeholder} disabled={disabled} {...field} />
        {icon && iconPosition === "right" && <span className="">{icon}</span>}
      </label>

      {/* {submitCount > 0 && error && <ErrorMessage name={name as string} component="div" className="text-error text-[12px]" />} */}
      {submitCount > 0 && error && <div className="text-error text-[12px]">{error}</div>}
    </div>
  );
};

export default CustomInput;
