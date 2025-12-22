import { ErrorMessage, FieldProps, getIn } from "formik";

interface CustomInputProps extends FieldProps {
  placeholder?: string;
  label?: string;
  rows?: number;
}

const CustomTextarea = ({
  field, // { name, value, onChange, onBlur }
  placeholder = "Enter your text",
  label = "",
  rows = 6,
  form,
}: CustomInputProps) => {
  const { name } = field;
  const { errors, submitCount } = form;
  // const error = errors[name];
  const error = getIn(errors, name);

  return (
    <div>
      {label && <span className="mb-1 block font-medium">{label}</span>}

      <label className="form-control">
        <textarea
          className={`textarea textarea-bordered w-full ${submitCount > 0 && error ? "!border-error focus-within:!border-error" : ""}`}
          placeholder={placeholder}
          rows={rows}
          {...field}
        ></textarea>
      </label>
      {/* {submitCount > 0 && error && <ErrorMessage name={field.name as string} component="div" className="text-error text-[12px]" />} */}
      {submitCount > 0 && error && <div className="text-error text-[12px]">{error}</div>}
    </div>
  );
};

export default CustomTextarea;
