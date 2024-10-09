import { Router } from "express";
import { isAuthenticated } from "../../middleware/authentication.js";
import { isAuthorized } from "../../middleware/autheraization.js";
import { roles } from "../../utils/constant/enums.js";
import { asyncHandler } from "../../utils/appError.js";
import { createOrder } from "./order.controller.js";

const orderRouter = Router()

// creat order
orderRouter.post('/',
  isAuthenticated(),
  isAuthorized([roles.ADMIN, roles.USER]),
  asyncHandler(createOrder)
)
export default orderRouter