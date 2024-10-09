import { Router } from "express";
import { isAuthenticated } from "../../middleware/authentication.js";
import { asyncHandler } from "../../utils/appError.js";

const userRouter = Router()

// reset password 
userRouter.put('/reset-password',
  isAuthenticated(),
  asyncHandler()
)
export default userRouter
