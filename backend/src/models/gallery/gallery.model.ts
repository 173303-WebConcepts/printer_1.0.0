import { model, Model, Schema } from "mongoose";

const gallerySchema: Schema<any> = new Schema(
  {
    image: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },

    shopType: { type: Schema.Types.ObjectId, ref: "ShopType" }, // RELATION
  },
  {
    timestamps: true,
  }
);

const Gallery: Model<any> = model<any>("Gallery", gallerySchema);

export default Gallery;
