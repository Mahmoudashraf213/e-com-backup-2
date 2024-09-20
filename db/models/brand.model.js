import mongoose, { model, Schema } from "mongoose";

// schema
const brandSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    logo: {
      secure_url: {
        type: String,
        required: true,
      },
      public_id: {
        type: String,
        required: true,
      },
    },
    creatBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: false, // todo true
    },
  },
  { timestamps: true, versionKey: false }
);
// model
export const Brand = model("Brand", brandSchema);
