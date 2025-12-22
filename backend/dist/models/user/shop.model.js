import { model, Schema } from "mongoose";
const shopTypeSchema = new Schema({
    type: {
        type: String,
        trim: true,
        lowercase: true,
    },
});
const ShopType = model("ShopType", shopTypeSchema);
export default ShopType;
//# sourceMappingURL=shop.model.js.map