import { Router } from "express";
import { isAuthenticated } from "../../middleware/authentication.js";
import { isAuthorized } from "../../middleware/autheraization.js";
import { roles } from "../../utils/constant/enums.js";
import { asyncHandler } from "../../utils/appError.js";

const orderRouter = Router()

// creat order
orderRouter.post('/',
  isAuthenticated(),
  isAuthorized(Object.values(roles)),
  asyncHandler()
)
export default orderRouter