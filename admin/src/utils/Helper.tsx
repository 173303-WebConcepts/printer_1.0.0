import Toast from "@/widgets/CustomToast";
import { convertToRaw } from "draft-js";

export class Helper {
  static formatMongodbDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(); // e.g., "7/22/2024" in the default locale
  };

  static convertToPakistanTime = (utcDate: string) => {
    const date = new Date(utcDate);
    const pakistanTimeOffset = 5 * 60; // Pakistan is UTC+5 in minutes
    const localOffset = date.getTimezoneOffset(); // Local offset in minutes

    // Adjust to Pakistan time by adding the difference between Pakistan offset and local offset
    const pakistanTime = new Date(date.getTime() + (pakistanTimeOffset + localOffset) * 60000);
    return pakistanTime;
  };

  // Extract plain text and count characters
  static getCharacterCount = (descriptionContent: any) => {
    if (!descriptionContent) return 0;
    const rawContent = convertToRaw(descriptionContent.getCurrentContent()); // Convert editor state to raw content
    const plainText = rawContent.blocks.map((block) => block.text).join(""); // Extract text
    return plainText.length;
  };

  static res = (res: any) => {

    if (res?.data?.success) return Toast.success(res?.data?.message);
    if (res?.data?.success === false) return Toast.error(res?.data?.message);
    if (res?.response?.data?.success === false) return Toast.error(res?.response?.data?.message);
  };

  static getDaysLeft(expiryDateStr: string): number {
    if (!expiryDateStr) return 0;

    const expiryDate = new Date(expiryDateStr);
    const today = new Date();

    // Set both dates to midnight (ignore time)
    expiryDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    const diffTime = expiryDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); // Convert ms → days

    return diffDays; // can be negative if expired
  }

  static reactSelectStyles = {
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
      paddingLeft: "3px",
      paddingRight: "10px",
      background: "var(--color-base-100)",
      fontSize: "1rem",
      outline: state.isFocused ? "2px solid var(--color-base-content)" : provided.outline,
      // outlineOffset: state.isFocused ? "2px" : provided.outlineOffset,
      border: "1px solid #404550",
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
}
