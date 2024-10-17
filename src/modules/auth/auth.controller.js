// auth.controller.js
import bcrypt from "bcrypt";
import crypto from "crypto";
import { Cart, User } from "../../../db/index.js";
import { AppError } from "../../utils/appError.js";
import { messages } from "../../utils/constant/messages.js";
import { sendEmail } from "../../utils/email.js";
import { generateToken, verifyToken } from "../../utils/token.js";
import { status } from "../../utils/constant/enums.js";

// signup 
export const signup = async (req, res, next) => {
  // get data from req
  let { name, email, password, phone } = req.body;
  // chech existence
  const userExists = await User.findOne({ $or: [{ email }, { phone }] });
  if (userExists) {
    return next(new AppError(messages.user.alreadyExist, 409));
  }
  // prepare data
  password = bcrypt.hashSync(password, 8);
  const user = new User({
    name,
    email,
    password,
    phone,
  });
  // add to db
  const createdUser = await user.save();
  if (!createdUser) {
    return next(new AppError(messages.user.failToCreate));
  }
  // genreate token 
  const token = generateToken({ payload: { email , _id:createdUser._id} })
  // send email
  await sendEmail({
    to:email,
    subject:"verify your account",
    html: `<p>Click on the link to verify your account: <a href="${req.protocol}://${req.headers.host}/auth/verify/${token}">Verify Account</a></p>`
  })
    // send response
  return res.status(201).json({
      message: messages.user.createSuccessfully,
      success: true,
      data: createdUser,
    });
};

// verify account
export const verifyAccount = async (req, res, next) => {
  // get data from req
  const { token } = req.params;
  // check token
  const payload = verifyToken({token})
  await User.findOneAndUpdate({ email: payload.email, status: status.PENDING }, { status: status.VERIFIED })
  await Cart.create({user:payload._id, prdoucts:[]})
  // send res
  return res.status(200).json({ message: messages.user.verified, success: true })
}

// login account
export const login = async (req, res, next) => {
  // get data from req
  const { email, phone, password } = req.body
  // check if user exist
  const userExist = await User.findOne({ $or: [{ email }, { phone }], status: status.VERIFIED })
  if (!userExist) {
      return next(new AppError(messages.user.invalidCredntiols, 400))
  }
  // check password
  const isMatch = bcrypt.compareSync(password, userExist.password)
  if (!isMatch) {
      return next(new AppError(messages.user.invalidCredntiols, 401))
  }
  // check if user is verified
  if (userExist.status !== status.VERIFIED) {
      return next(new AppError(messages.user.notVerified, 401))
  }
  // genrate token
  const token = generateToken({ payload: { _id: userExist._id, email: userExist.email } })
  // send res 
  return res.status(200).json({
      message: messages.user.loginSuccessfully,
      success: true,
      token
  })
}


// Forgot password - generate OTP and send to email
export const forgotPassword = async (req, res, next) => {
  const { email } = req.body;

  // Check if user exists
  const user = await User.findOne({ email });
  if (!user) {
    return next(new AppError(messages.user.notFound, 404));
  }

  // Generate OTP
  const otp = crypto.randomInt(100000, 999999).toString(); // 6-digit OTP
  user.otp = otp;
  user.otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes expiration
  await user.save();

  // Send OTP via email
  await sendEmail({
    to: email,
    subject: "Reset Your Password",
    html: `<p>Your OTP code for resetting your password is: <strong>${otp}</strong></p>`,
  });

  // Send response
  return res.status(200).json({
    message: messages.user.otpSent,
    success: true,
  });
};

// Verify OTP and reset password
export const resetPassword = async (req, res, next) => {
  const { email, otp, newPassword } = req.body;

  // Find user by email and verify OTP
  const user = await User.findOne({
    email,
    otp,
    otpExpires: { $gt: Date.now() }, // Check if OTP is still valid
  });

  if (!user) {
    return next(new AppError(messages.user.invalidOTP, 400));
  }

  // Hash the new password and update
  user.password = bcrypt.hashSync(newPassword, 8);
  user.otp = null;
  user.otpExpires = null;
  await user.save();

  // Send success response
  return res.status(200).json({
    message: messages.user.passwordResetSuccess,
    success: true,
  });
};