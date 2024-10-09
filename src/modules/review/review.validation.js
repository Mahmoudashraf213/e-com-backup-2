import joi from "joi";
import { generalFields } from "../../middleware/vaildation.js";

export const addReviewVal = joi.object({
    comment: generalFields.comment.optional(),
    rate: generalFields.rate.required(),
    productId: generalFields.objectId.required()
})


export const updateReviewVal = joi.object({
    comment: generalFields.comment.optional(),
    rate: generalFields.rate.required(),
    productId: generalFields.objectId.required(),
    reviewId: generalFields.objectId.required(),
  });