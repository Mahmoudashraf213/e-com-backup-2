// auth.router.js
import { Router } from "express";
import { isValid } from "../../middleware/vaildation.js";
import { asyncHandler } from "../../utils/appError.js";
import { forgotPasswordVal, loginVal, resetPasswordVal, signupVal } from "./auth.validation.js";
import { forgotPassword, login, resetPassword, signup, verifyAccount } from "./auth.controller.js";

const authRouter = Router()

// sign up
authRouter.post('/signup',isValid(signupVal),asyncHandler(signup))
authRouter.get('/verify/:token',asyncHandler(verifyAccount))
// login
authRouter.post('/login',isValid(loginVal),asyncHandler(login))
// forgot password
authRouter.post('/forgot-password', isValid(forgotPasswordVal), asyncHandler(forgotPassword));
// reset password
authRouter.post('/reset-password', isValid(resetPasswordVal), asyncHandler(resetPassword));


export default authRouter


