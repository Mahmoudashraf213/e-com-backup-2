import { model, Schema } from "mongoose";

// schema
const brandSchema = new Schema(
  {
    name: {
      type: String,
      require: true,
      uniqued: true,
      lowercase: true,
      trim: true,
    },
    slug:{
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    logo:{
      secure_url:{
            type: String,
            required:true,
      },
      public_id:{
            type: String,
            required: true,
      }
    },
    creatBy:{
      type:Schema.Types.ObjectId,
      ref:'User',
      required: false, // todo true
    }
  },
  { timestamps: true }
);
// model
export const Brand = model('Brand',brandSchema)

