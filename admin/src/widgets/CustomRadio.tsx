import { FieldProps } from "formik";

interface CustomRadioProps extends FieldProps {
  label?: string;
  value: boolean;
}

const CustomRadio = ({ field, form, label = "", value }: CustomRadioProps) => {
  return (
    <label className="flex items-center gap-2 cursor-pointer">
      <input
        type="radio"
        className="radio radio-primary"
        name={field.name}
        checked={Boolean(field.value) === value} // ✅ Compare booleans
        onChange={() => form.setFieldValue(field.name, value)} // ✅ Ensure correct value updates
      />
      {label && <span className="font-medium">{label}</span>}
    </label>
  );
};

export default CustomRadio;
