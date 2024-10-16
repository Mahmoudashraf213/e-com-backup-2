import joi from "joi";
import { generalFields } from "../../middleware/vaildation.js";
import { paymentType } from "../../utils/constant/enums.js";

export const createOrderVal = joi.object({
  address: joi.string().min(10).required(),
  phone: generalFields.phone.required(),
  coupon: joi.string().optional(),
  payment: joi.string().valid(...Object.values(paymentType)).required(),
});