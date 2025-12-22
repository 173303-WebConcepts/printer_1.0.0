import * as Yup from "yup";

// Pakistani phone number regex
const pakPhoneRegExp = /^(\+92|0)?3[0-9]{2}[0-9]{7}$/;

// 🇵🇰 Pakistani phone number regex
const phoneRegExp = /^(?:\+92|0092|0)?3[0-9]{9}$/;

export class ValidationSchema {
  static register = Yup.object({
    name: Yup.string()
      .min(3, "Name must be at least 3 characters long.")
      .max(30, "Name must be less than or equal to 30 characters.")
      .matches(/^[a-zA-Z ]+$/, "Name must contain only alphabetic characters and spaces.")
      .required("Name is required."),

    email: Yup.string().email("Must be a valid email").required("Email is required."),

    password: Yup.string().min(8, "Password must be at least 8 characters long.").required("Password is required."),

    confirmPassword: Yup.string()
      .oneOf([Yup.ref("password")], "Passwords must match.")
      .required("Confirm Password is required."),

    // role: Yup.string().oneOf(["buyer", "seller"], "Role must be either 'buyer' or 'seller'.").required("Role is required."),
  });

  static login = Yup.object({
    phone: Yup.string().matches(phoneRegExp, "Invalid Pakistani phone number format").required("Phone number is required"),

    password: Yup.string().required("Password is required"),
  });

  static forgotPassword = Yup.object({
    email: Yup.string().email("Invalid email address").required("Email is required"),
  });

  static resetPassword = Yup.object({
    password: Yup.string().required("Password is required").min(6, "Password must be at least 6 characters long"),

    confirmPassword: Yup.string()
      .oneOf([Yup.ref("password")], "Passwords must match")
      .required("Confirm Password is required"),
  });

  static shopTypes = Yup.object({
    shopTypes: Yup.array().min(1, "At least one shop type is required").required("Shop types are required"),
  });

  static user = Yup.object({
    name: Yup.string()
      .trim()
      // .matches(/^[A-Za-z\s]+$/, "Name must contain only alphabets")
      .required("Name is required"),

    phone: Yup.string().matches(phoneRegExp, "Invalid Pakistani phone number (e.g. 3001234567)").required("Phone number is required"),

    password: Yup.string()
      .matches(/^\d{6}$/, "Password must be a 6-digit numeric code")
      .required("Password is required"),

    shopType: Yup.object().required("Password is required"),

    // image: Yup.mixed()
    //   .test("image-required", "Image is required", (value: any) => {
    //     // Allow either a string (existing image) or an array with at least one file
    //     if (typeof value === "string" && value.trim() !== "") return true;
    //     if (Array.isArray(value) && value.length > 0) return true;
    //     return false;
    //   })
    //   .required("Image is required"),
  });

  static changePassword = Yup.object({
    password: Yup.string()
      .matches(/^\d{6}$/, "Password must be a 6-digit numeric code")
      .required("New password is required"),

    confirmPassword: Yup.string()
      .oneOf([Yup.ref("password")], "Passwords must match")
      .required("Confirm Password is required"),
  });

  static category = Yup.object({
    name: Yup.string().trim().required("Name is required"),

    shopType: Yup.object().required("Shop type is required"),
  });

  static shopCategory = Yup.object({
    name: Yup.string().trim().required("Name is required"),
  });

  static addProduct = Yup.object().shape({
    name: Yup.string().trim().required("Product name is required").min(2, "Product name must be at least 2 characters"),

    unit: Yup.object().required("Unit is required"),

    purchasePrice: Yup.number()
      .typeError("Purchase price must be a valid number")
      .required("Purchase price is required")
      .min(0, "Purchase price cannot be negative"),

    sellingPrice: Yup.number()
      .typeError("Selling price must be a valid number")
      .required("Selling price is required")
      .min(0, "Selling price cannot be negative")
      .test("is-greater", "Selling price must be greater than or equal to purchase price", function (value) {
        const { purchasePrice } = this.parent;
        return value >= purchasePrice;
      }),

    tax: Yup.number().typeError("Tax must be a valid number").min(0, "Tax cannot be negative").max(100, "Tax cannot exceed 100%"),

    stock: Yup.number()
      .typeError("Stock must be a valid number")
      .integer("Stock must be an integer")
      .min(0, "Stock cannot be negative")
      .required("Stock quantity is required"),

    isActive: Yup.boolean().required("Product active status is required"),

    categoryId: Yup.object().required("Category is required"),

    brandId: Yup.object().required("Brand is required"),

    image: Yup.mixed()
      .test("image-required", "Image is required", (value: any) => {
        // Allow either a string (existing image) or an array with at least one file
        if (typeof value === "string" && value.trim() !== "") return true;
        if (Array.isArray(value) && value.length > 0) return true;
        return false;
      })
      .required("Image is required"),
  });

  static gallery = Yup.object().shape({
    shopType: Yup.object().required("Shop Type is required"),

    images: Yup.mixed()
      .test("image-required", "Image is required", (value: any) => {
        // Allow either a string (existing image) or an array with at least one file
        if (typeof value === "string" && value.trim() !== "") return true;
        if (Array.isArray(value) && value.length > 0) return true;
        return false;
      })
      .required("Image is required"),
  });
}
