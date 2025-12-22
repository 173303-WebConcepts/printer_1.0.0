import { model, Schema } from "mongoose";
const brandSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        unique: true,
        lowercase: true,
    },
    image: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    products: [{ type: Schema.Types.ObjectId, ref: "Product", required: true }], // RELATION
}, {
    timestamps: true,
});
const Brand = model("Brand", brandSchema);
export default Brand;
//# sourceMappingURL=brand.model.js.map