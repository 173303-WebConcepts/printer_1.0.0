import React, { KeyboardEventHandler, useState } from "react";
import CreatableSelect from "react-select/creatable";
import { FieldProps, getIn, ErrorMessage } from "formik";
import { PiLineVerticalThin } from "react-icons/pi";

interface Option {
  readonly label: string;
  readonly value: string;
}

const components = {
  DropdownIndicator: null,
};

const createOption = (label: string): Option => ({
  label,
  value: label,
});

export const CustomMultiTextInput: React.FC<
  FieldProps & {
    label?: string;
    placeholder?: string;
  }
> = ({ field, icon, form, label, isDisabled, placeholder = "Type and press Enter..." }: any) => {
  const [inputValue, setInputValue] = useState("");
  const { name, value } = field;
  const { setFieldValue, errors, submitCount } = form;

  const error = getIn(errors, name);

  const handleKeyDown: KeyboardEventHandler = (event) => {
    if (!inputValue) return;
    switch (event.key) {
      case "Enter":
      case "Tab":
        setFieldValue(name, [...(value || []), createOption(inputValue)]);
        setInputValue("");
        event.preventDefault();
    }
  };

  const handleChange = (newValue: readonly Option[]) => {
    setFieldValue(name, newValue);
  };

  const customStyles = {
    clearIndicator: (provided: any) => ({
      ...provided,
      color: "var(--color-base-content)",
      "&:hover": {
        color: "var(--color-primary)",
      },
    }),
    dropdownIndicator: (provided: any) => ({
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
      paddingLeft: icon ? "60px" : "3px",
      paddingRight: "10px",
      background: isDisabled ? "var(--color-neutral)" : "var(--color-base-100)",
      fontSize: "1rem",
      outline: state.isFocused ? "2px solid var(--color-base-content)" : provided.outline,
      border: submitCount > 0 && error ? "1px solid var(--color-error)" : state.isFocused ? "1px solid #404550" : "1px solid #404550",
      boxShadow: "none",
      "&:hover": {
        border: state.isFocused ? "1px solid #404550" : "1px solid #404550",
      },
    }),
    multiValue: (provided: any) => ({
      ...provided,
      backgroundColor: "var(--color-primary)",
      color: "var(--color-primary-content)",
      borderRadius: "0.3rem",
    }),
    multiValueLabel: (provided: any) => ({
      ...provided,
      color: "var(--color-primary-content)",
      fontWeight: 500,
    }),
    multiValueRemove: (provided: any) => ({
      ...provided,
      color: "var(--color-primary-content)",
      ":hover": {
        backgroundColor: "var(--color-primary-content)",
        color: "var(--color-primary)",
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

  return (
    <div>
      {label && <span className="mb-1 block font-medium">{label}</span>}
      <div className="relative">
        {icon && (
          <div className="absolute top-3 left-[1.5rem] z-10 flex items-center gap-1.5">
            {icon} <PiLineVerticalThin />
          </div>
        )}

        <CreatableSelect
          components={components}
          inputValue={inputValue}
          isClearable
          isMulti
          menuIsOpen={false}
          onChange={handleChange}
          onInputChange={(val) => setInputValue(val)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          value={value || []}
          styles={customStyles}
        />

        {submitCount > 0 && error && <ErrorMessage name={name} component="div" className="text-error text-[12px]" />}
      </div>
    </div>
  );
};
