import { model, Schema } from "mongoose";
const unitConstant = [
    // General
    "pcs", // pieces
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
const productSchema = new Schema({
    name: { type: String, required: true, trim: true },
    sku: { type: String, unique: true, required: true, uppercase: true, trim: true }, // Stock Keeping Unit
    barcode: { type: String, unique: true, sparse: true }, // optional barcode/QR
    unit: {
        type: String,
        enum: unitConstant,
        default: "pcs",
    },
    costPrice: { type: Number, min: 0 }, // purchase cost
    sellingPrice: { type: Number, required: true, min: 0 }, // selling price
    tax: { type: Number, default: 0 }, // percentage
    stock: { type: Number, default: 0, min: 0 },
    isActive: { type: Boolean, default: true },
    brand: { type: Schema.Types.ObjectId, ref: "Brand" },
    category: { type: Schema.Types.ObjectId, ref: "Category", required: true }, // RELATION
    user: { type: Schema.Types.ObjectId, ref: "User", required: true }, // RELATION
}, {
    timestamps: true,
});
const Product = model("Product", productSchema);
export default Product;
//# sourceMappingURL=product.model.js.map