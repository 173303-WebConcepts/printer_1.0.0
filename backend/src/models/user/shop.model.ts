import { model, Model, Schema } from "mongoose";

const shopTypeSchema: Schema<any> = new Schema<any>({
  type: {
    type: String,
    trim: true,
    lowercase: true,
    unique: true, // ✅ Enforce DB-level uniqueness
  },
});

const ShopType: Model<any> = model<any>("ShopType", shopTypeSchema);

export default ShopType;
