import { model, Schema } from "mongoose";
const categorySchema = new Schema({
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
    user: { type: Schema.Types.ObjectId, ref: "User", required: true }, // RELATION
}, {
    timestamps: true,
});
const Category = model("Category", categorySchema);
export default Category;
//# sourceMappingURL=category.model.js.map