import bcrypt from "bcrypt";
import { User } from "../../../db/index.js";
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
  const token = generateToken({ payload: { email } })
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
  const payload = verifyToken(token)
  await User.findOneAndUpdate({ email: payload.email, status: status.PENDING }, { status: status.VERIFIED })
  // send res
  return res.status(200).json({ message: messages.user.verified, success: true })
}

// lohin account
export const login = async (req, res, next) => {
  // get data from req
  const { email, phone, password } = req.body
  // check if user exist
  const userExist = await User.findOne({ $or: [{ email }, { phone }] })
  if (!userExist) {
      return next(new AppError(messages.user.invalidCredntiols, 400))
  }
  // check password
  const isMatch = bcrypt.compareSync(password, userExist.password)
  if (!isMatch) {
      return next(new AppErroror(messages.user.invalidCredntiols, 401))
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