import * as Yup from "yup";

// Pakistani phone number regex
const pakPhoneRegExp = /^(\+92|0)?3[0-9]{2}[0-9]{7}$/;

// 🇵🇰 Pakistani phone number regex
const phoneRegExp = /^(?:\+92|0092|0)?3[0-9]{9}$/;

export class ValidationSchema {
  static addProduct = Yup.object().shape({
    name: Yup.string().trim().required("Product name is required").min(2, "Product name must be at least 2 characters"),

    unit: Yup.object({
      // label: Yup.string().required("Unit label is required"),
      // value: Yup.string().required("Unit value is required"),
    }).required("Unit is required"),

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

    // tax: Yup.number().typeError("Tax must be a valid number").min(0, "Tax cannot be negative").max(100, "Tax cannot exceed 100%"),

    stock: Yup.number()
      .typeError("Stock must be a valid number")
      .integer("Stock must be an integer")
      .min(0, "Stock cannot be negative")
      .required("Stock quantity is required"),

    isActive: Yup.boolean().required("Product active status is required"),

    categoryId: Yup.object().nullable(),

    brandId: Yup.object().nullable(),

    image: Yup.mixed()
      .required("Image is required")
      .test("is-valid-image", "Invalid image", (value: any) => {
        if (!value) return false;

        // CASE 1: New image from picker { uri: "file://..." }
        if (value?.uri && typeof value.uri === "string") {
          return true;
        }

        // CASE 2: Existing Realm Image { binary: Uint8Array, mimeType: "image/jpeg" }
        if (value?.binary && value?.mimeType) {
          return true;
        }

        // CASE 3: If accidentally passed a string URL (not recommended, but supported)
        if (typeof value === "string" && value.trim() !== "") {
          return true;
        }

        return false;
      }),
  });

  static profile = Yup.object().shape({
    image: Yup.mixed()
      .required("Image is required")
      .test("is-valid-image", "Invalid image", (value: any) => {
        if (!value) return false;

        // CASE 1: New image from picker { uri: "file://..." }
        if (value?.uri && typeof value.uri === "string") {
          return true;
        }

        // CASE 2: Existing Realm Image { binary: Uint8Array, mimeType: "image/jpeg" }
        if (value?.binary && value?.mimeType) {
          return true;
        }

        // CASE 3: If accidentally passed a string URL (not recommended, but supported)
        if (typeof value === "string" && value.trim() !== "") {
          return true;
        }

        return false;
      }),
  });
}
