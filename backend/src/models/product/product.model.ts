import { model, Model, Schema } from "mongoose";

export const unitConstant = [
  // General
  "piece", // pieces
  "box", // box
  "pack", // packet
  "set", // set
  "dozen", // 12 pcs

  // Weight
  "mg", // milligram
  "g", // gram
  "kg", // kilogram
  "ton", // metric ton

  // Volume (liquids, chemicals, food)
  "ml", // milliliter
  "ltr", // liter
  "gal", // gallon

  // Length / Area (fabric, construction, etc.)
  "mm", // millimeter
  "cm", // centimeter
  "m", // meter
  "km", // kilometer
  "inch", // inch
  "ft", // foot
  "yd", // yard
  "sqft", // square foot
  "sqm", // square meter

  // Time-based (services/subscriptions)
  "hour",
  "day",
  "month",
  "year",
];

const productSchema: Schema<any> = new Schema(
  {
    name: { type: String, required: true, trim: true },

    image: {
      type: String,
      required: true,
    },

    unit: {
      type: String,
      enum: unitConstant,
      default: "pcs",
    },

    purchasePrice: { type: Number, min: 0 },
    sellingPrice: { type: Number, required: true, min: 0 }, // selling price

    stock: { type: Number, default: 0, min: 0 },

    isActive: { type: Boolean, default: true },

    brandId: { type: Schema.Types.ObjectId, ref: "Brand" },
    categoryId: { type: Schema.Types.ObjectId, ref: "Category" }, // RELATION
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true }, // RELATION
  },
  {
    timestamps: true,
  }
);

const Product: Model<any> = model<any>("Product", productSchema);

export default Product;
