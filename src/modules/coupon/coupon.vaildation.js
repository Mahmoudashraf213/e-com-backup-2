import joi from "joi"
import { generalFields } from "../../middleware/vaildation.js"

export const addCouponVal = joi.object({
  code: joi.string().max(6),
  discountAmount: joi.number().positive().required(),
  discountType: generalFields.discountType.required(),
  fromDate:joi.date().greater(Date.now()-24*60*60*1000).required(),
  toDate: joi.date().greater(joi.ref('fromDate')).required()
})

export const updateCouponVal = joi.object({
  couponId: generalFields.objectId.required(),
  code: joi.string().max(6),
  discountAmount: joi.number().positive(),
  discountType: generalFields.discountType,
  fromDate: joi.date().greater(Date.now() - 24 * 60 * 60 * 1000),
  toDate: joi.date().greater(joi.ref("fromDate"))
});