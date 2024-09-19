import { model, Schema } from "mongoose";
import { roles } from "../../src/utils/constant/enums.js";

//schema
const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    role: {
      type: String,
      enum: Object.values(roles),
      default: roles.USER,
    },
    status:{
      type: String,
      enum:["pending", "verified", "blocked" ],
      default: "pending"
    },
    image: {
      secure_url: { type: String, required: false },
      public_id: { type: String, required: false },
    },
    DOB: { type: String, default: Date.now() },
    // isBlocked: {
    //   type: Boolean,
    //   default: false,
    // },
    // confirmEmail: {
    //   type: Boolean,
    //   default: false,
    // },
    // otp: {
    //   type: String,
    //   default: null,
    // },
    // otpExpires: {
    //   type: Date,
    //   default: null,
    // },
  },
  { timestamps: true }
);

//model
export const User = model("USer",userSchema)