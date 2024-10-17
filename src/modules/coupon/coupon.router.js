import { Router } from "express";
import { isAuthenticated } from "../../middleware/authentication.js";
import { isAuthorized } from "../../middleware/autheraization.js";
import { isValid } from "../../middleware/vaildation.js";
import { roles } from "../../utils/constant/enums.js";
import { addCouponVal, updateCouponVal } from "./coupon.vaildation.js";
import { asyncHandler } from "../../utils/appError.js";
import { addCoupon, deleteCoupon, getAllCoupons, getCoupon, updateCoupon } from "./coupon.controller.js";

const couponRouter = Router()

// add coupon
couponRouter.post('/',
  isAuthenticated(),
  isAuthorized([roles.ADMIN]),
  isValid(addCouponVal),
  asyncHandler(addCoupon)
)

// Update coupon
couponRouter.put(
  "/:couponId",
  isAuthenticated(),
  isAuthorized([roles.ADMIN]),
  isValid(updateCouponVal),
  asyncHandler(updateCoupon)
);

// Get all coupons
couponRouter.get(
  '/',
  isAuthenticated(),
  isAuthorized([roles.ADMIN]),
  asyncHandler(getAllCoupons)
);

// Get specific coupon by ID
couponRouter.get(
  '/get-specific/:couponId',
  isAuthenticated(),
  isAuthorized([roles.ADMIN]),
  asyncHandler(getCoupon)
);

// Delete coupon by ID
couponRouter.delete(
  '/:couponId',
  isAuthenticated(),
  isAuthorized([roles.ADMIN]), 
  asyncHandler(deleteCoupon)
);

export default couponRouter