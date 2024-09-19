import { model, Schema } from "mongoose";

// schema
const categorySchema = new Schema(
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
    image: {
      type: Object,// {path} // {secure_url:,public_id:}
      required: true
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: false, //todo true
    },
  },
  { timestamps: true }
);

// model
export const Category = model('Category', categorySchema)
