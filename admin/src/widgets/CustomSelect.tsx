import { ErrorMessage, FieldProps, getIn } from "formik";
import { useEffect, useState } from "react";
import Select from "react-select";
import { PiLineVerticalThin } from "react-icons/pi";

export const CustomSelect: React.FC<any & FieldProps> = ({
  options,
  isClearable = true,
  isSearchable = true,
  isMulti = false,
  placeholder = `Select `,
  isDisabled = false,
  label = "",
  icon,
  field,
  form,
  add = false,
}) => {
  const { name } = field;
  const { errors, submitCount } = form;
  // const error = errors[name];
  const error = getIn(errors, name);

  const [isMounted, setIsMounted] = useState(false);

  // Must be deleted once
  // https://github.com/JedWatson/react-select/issues/5459 is fixed.
  useEffect(() => setIsMounted(true), []);

  const handleChange = (selectedOption: any) => {
    form.setFieldValue(field.name, selectedOption);
  };

  const customStyles = {
    clearIndicator: (provided: any) => ({
      ...provided,
      color: "var(--color-base-content)",
      "&:hover": {
        color: "var(--color-primary)",
      },
    }),
    dropdownIndicator: (provided: any, state: any) => ({
      ...provided,
      color: "var(--color-base-content)",
      "&:hover": {
        color: "var(--color-primary)",
      },
    }),
    indicatorSeparator: (provided: any) => ({
      ...provided,
      background: "#404550",
    }),
    menu: (provided: any) => ({
      ...provided,
      zIndex: 1000,
      background: "var(--color-base-content)",
    }),

    option: (provided: any, state: any) => ({
      ...provided,
      backgroundColor: state.isSelected ? "var(--color-primary)" : "var(--color-base-200)",
      color: state.isSelected ? "black" : "var(--color-base-content)",
      cursor: "pointer",
      "&:hover": {
        color: "var(--color-primary-content)",
        backgroundColor: "var(--color-primary)",
      },
    }),
    control: (provided: any, state: any) => ({
      ...provided,
      minWidth: "200px",
      minHeight: "38.67px",
      borderRadius: "0.2rem",
      paddingLeft: icon ? "48px" : "3px",
      paddingRight: "10px",
      background: isDisabled ? "var(--color-base-200)" : "var(--color-base-100)",
      fontSize: "1rem",
      outline: state.isFocused ? "2px solid var(--color-base-content)" : provided.outline,
      // outlineOffset: state.isFocused ? "2px" : provided.outlineOffset,
      border: submitCount > 0 && error ? "1px solid var(--color-error)" : state.isFocused ? "1px solid #404550" : "1px solid #404550",
      boxShadow: "none",
      "&:hover": {
        border: state.isFocused ? "1px solid #404550" : "1px solid #404550",
        // borderBottom: state.isFocused ? "4px solid #404550" : "4px solid #404550",
      },
    }),
    singleValue: (provided: any) => ({
      ...provided,
      color: "var(--color-base-content)",
    }),
    input: (provided: any) => ({
      ...provided,
      color: "var(--color-base-content)",
    }),
    placeholder: (provided: any) => ({
      ...provided,
      color: "#707781",
    }),
  };

  return isMounted ? (
    <div>
      <div className="flex justify-between">
        {label && <span className="mb-1 block font-medium">{label}</span>}
        {add}
      </div>
      <div className="relative">
        {icon && (
          <div className="absolute top-3 left-[0.9rem] z-10 flex items-center gap-1.5">
            {icon} <PiLineVerticalThin />
          </div>
        )}
        <Select
          className="basic-single"
          classNamePrefix="select"
          value={field.value}
          isClearable={isClearable}
          isSearchable={isSearchable}
          name={field.name}
          options={options}
          onChange={handleChange}
          isMulti={isMulti}
          placeholder={placeholder}
          isDisabled={isDisabled}
          styles={customStyles}
        />
      </div>
      {submitCount > 0 && error && <ErrorMessage name={field.name as string} component="div" className="text-error text-[12px]" />}
    </div>
  ) : null;
};

// import { ErrorMessage, FieldProps, getIn } from "formik";
// import Select from "react-select";
// import { PiLineVerticalThin } from "react-icons/pi";

// export const CustomSelect: React.FC<any & FieldProps> = ({
//   options,
//   isClearable = true,
//   isSearchable = true,
//   isMulti = false,
//   placeholder = `Select`,
//   isDisabled = false,
//   label = "",
//   icon,
//   field,
//   form,
// }) => {
//   const { name, value } = field;
//   const { errors, touched, setFieldValue, submitCount } = form;

//   const error = getIn(errors, name);

//   const handleChange = (selectedOption: any) => {
//     console.log("EEEEE:::", name, selectedOption)
//     setFieldValue(name, selectedOption);
//   };

//   const getValue = () => {
//     if (!options) return isMulti ? [] : null;
//     return isMulti ? options.filter((option: any) => value?.includes(option.value)) : options.find((option: any) => option.value === value) || null;
//   };

//   const customStyles = {
//     clearIndicator: (provided: any) => ({
//       ...provided,
//       color: "var(--color-base-content)",
//       "&:hover": {
//         color: "var(--color-primary)",
//       },
//     }),
//     dropdownIndicator: (provided: any, state: any) => ({
//       ...provided,
//       color: "var(--color-base-content)",
//       "&:hover": {
//         color: "var(--color-primary)",
//       },
//     }),
//     indicatorSeparator: (provided: any) => ({
//       ...provided,
//       background: "#404550",
//     }),
//     menu: (provided: any) => ({
//       ...provided,
//       zIndex: 1000,
//       background: "var(--color-base-content)",
//     }),

//     option: (provided: any, state: any) => ({
//       ...provided,
//       backgroundColor: state.isSelected ? "var(--color-primary)" : "var(--color-base-200)",
//       color: state.isSelected ? "black" : "var(--color-base-content)",
//       cursor: "pointer",
//       "&:hover": {
//         color: "var(--color-primary-content)",
//         backgroundColor: "var(--color-primary)",
//       },
//     }),
//     control: (provided: any, state: any) => ({
//       ...provided,
//       minWidth: "200px",
//       minHeight: "38.67px",
//       borderRadius: "0.2rem",
//       paddingLeft: icon ? "60px" : "3px",
//       paddingRight: "10px",
//       background: isDisabled ? "var(--color-netural)" : "var(--color-base-100)",
//       fontSize: "1rem",
//       //   outline: state.isFocused ? "2px solid var(--color-primary)" : provided.outline,
//       outlineOffset: state.isFocused ? "2px" : provided.outlineOffset,
//       border: submitCount > 0 && error ? "1px solid var(--color-error)" : state.isFocused ? "1px solid #404550" : "1px solid #404550",
//       boxShadow: "none",
//       "&:hover": {
//         border: state.isFocused ? "1px solid #404550" : "1px solid #404550",
//         // borderBottom: state.isFocused ? "4px solid #404550" : "4px solid #404550",
//       },
//     }),
//     singleValue: (provided: any) => ({
//       ...provided,
//       color: "var(--color-base-content)",
//     }),
//     input: (provided: any) => ({
//       ...provided,
//       color: "var(--color-base-content)",
//     }),
//     placeholder: (provided: any) => ({
//       ...provided,
//       color: "#707781",
//     }),
//   };

//   return (
//     <div>
//       {label && <span className="mb-1 block font-medium">{label}</span>}
//       <div className="relative">
//         {icon && (
//           <div className="absolute top-6 left-[1.5rem] z-10 flex items-center gap-1.5">
//             {icon} <PiLineVerticalThin />
//           </div>
//         )}
//         <Select
//           className="basic-single"
//           classNamePrefix="select"
//           name={name}
//           value={getValue()}
//           isClearable={isClearable}
//           isSearchable={isSearchable}
//           isMulti={isMulti}
//           placeholder={placeholder}
//           isDisabled={isDisabled}
//           options={options}
//           onChange={handleChange}
//           styles={customStyles}
//         />
//       </div>
//       {submitCount > 0 && error && <ErrorMessage name={name} component="div" className="text-error text-[12px]" />}
//     </div>
//   );
// };
