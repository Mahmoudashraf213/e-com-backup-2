import joi from "joi";
import { generalFields } from "../../middleware/vaildation.js";

export const addToCartVal = joi.object({
  productId: generalFields.objectId.required(),
  quantity: generalFields.quantity.required(),
});
