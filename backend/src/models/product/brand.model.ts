import { model, Model, Schema } from "mongoose";

const brandSchema: Schema<any> = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },

    shopType: { type: Schema.Types.ObjectId, ref: "ShopType" }, // RELATION
    productIds: [{ type: Schema.Types.ObjectId, ref: "Product", required: true }], // RELATION
    users: [
      {
        user: {
          type: Schema.Types.ObjectId,
          ref: "User",
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Brand: Model<any> = model<any>("Brand", brandSchema);

export default Brand;
