import { Router } from "express";
import { isAuthenticated } from "../../middleware/authentication.js";
import { isAuthorized } from "../../middleware/autheraization.js";
import { isValid } from "../../middleware/vaildation.js";
import { roles } from "../../utils/constant/enums.js";
import { addCouponVal } from "./coupon.vaildation.js";
import { asyncHandler } from "../../utils/appError.js";
import { addCoupon } from "./coupon.controller.js";

const couponRouter = Router()

// add coupon
couponRouter.post('/',
  isAuthenticated(),
  isAuthorized([roles.ADMIN]),
  isValid(addCouponVal),
  asyncHandler(addCoupon)
)

export default couponRouter