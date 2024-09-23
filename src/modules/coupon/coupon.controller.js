import { Coupon } from "../../../db/index.js";
import { AppError } from "../../utils/appError.js";
import { discountTypes } from "../../utils/constant/enums.js";
import { messages } from "../../utils/constant/messages.js";

export const addCoupon = async (req, res, next) => {
  // get data from req
  const { code, discountAmount, discountType, toDate, fromDate } = req.body;
  const userId = req.authuser_id;
  // check coupon exists
  const couponExists = await Coupon.findOne({ code });
  if (couponExists) {
    return next(new AppError(messages.coupon.alreadyExist, 409));
  }
  // check if percentage
  if (discountType == discountTypes.PERCENTAGE && discountAmount > 100) {
    return next(new AppError("must be less than 100", 400));
  }
  // perpare data
  const coupon = new Coupon({
    code,
    discountAmount,
    discountType,
    toDate,
    fromDate,
    createdBy: userId,
  });
  // add to db
  const createdCoupon = await coupon.save();
  if (!createdCoupon) {
    return next(new AppError(messages.coupon.failToCreate, 500));
  }
  // send response
  return res.status(201).json({
      messga: messages.coupon.createSuccessfully,
      success: true,
      data: createdCoupon,
    });
};
