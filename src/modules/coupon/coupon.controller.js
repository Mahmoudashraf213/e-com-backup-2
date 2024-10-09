import { Coupon } from "../../../db/index.js";
import { ApiFeature } from "../../utils/apiFeatures.js";
import { AppError } from "../../utils/appError.js";
import { discountTypes } from "../../utils/constant/enums.js";
import { messages } from "../../utils/constant/messages.js";

// add coupon 
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

// update coupon
export const updateCoupon = async (req, res, next) => {
  const { couponId } = req.params;
  const { code, discountAmount, discountType, toDate, fromDate } = req.body;
  const userId = req.authuser_id;

  // Find the coupon by ID
  const coupon = await Coupon.findById(couponId);
  if (!coupon) {
    return next(new AppError(messages.coupon.notFound, 404));
  }

  // Check if the code is being updated and if it already exists
  if (code && code !== coupon.code) {
    const couponExists = await Coupon.findOne({ code });
    if (couponExists) {
      return next(new AppError(messages.coupon.alreadyExist, 409));
    }
  }

  // Check if the discountType is percentage and validate discountAmount
  if (discountType == discountTypes.PERCENTAGE && discountAmount > 100) {
    return next(new AppError("Discount amount must be less than or equal to 100 for percentage-based coupons", 400));
  }

  // Update coupon details
  coupon.code = code || coupon.code;
  coupon.discountAmount = discountAmount || coupon.discountAmount;
  coupon.discountType = discountType || coupon.discountType;
  coupon.toDate = toDate || coupon.toDate;
  coupon.fromDate = fromDate || coupon.fromDate;
  coupon.createdBy = userId;

  // Save the updated coupon
  const updatedCoupon = await coupon.save();
  if (!updatedCoupon) {
    return next(new AppError(messages.coupon.failToUpdate, 500));
  }

  return res.status(200).json({
    message: messages.coupon.updateSuccessfully,
    success: true,
    data: updatedCoupon,
  });
};

// get all coupon
export const getAllCoupons = async (req, res, next) => {
  // Fetch all coupons from the database
  const coupons = await Coupon.find();

  if (!coupons || coupons.length === 0) {
    return next(new AppError(messages.coupon.noCouponsFound, 404));
  }

  // Send response
  return res.status(200).json({
    message: messages.coupon.getAllSuccessfully,
    success: true,
    length: coupons.length ,
    data: coupons,
  });
};

// get specfic coupon
export const getCoupon = async (req, res, next) => {
  const { couponId } = req.params;

  // Initialize query
  let mongooseQuery = Coupon.findById(couponId);

  // Use ApiFeature to handle filtering, sorting, selecting, and pagination
  const apiFeature = new ApiFeature(mongooseQuery, req.query)
    .filter()
    .sort()
    .select()
    .pagination();

  const coupon = await apiFeature.mongooseQuery;

  if (!coupon) {
    return next(new AppError(messages.coupon.notFound, 404));
  }

  // Send response
  return res.status(200).json({
    message: messages.coupon.getSuccessfully,
    success: true,
    data: coupon,
  });
};

// delete coupon
export const deleteCoupon = async (req, res, next) => {
  const { couponId } = req.params;

  // Find and delete the coupon by ID
  const deletedCoupon = await Coupon.findByIdAndDelete(couponId);

  if (!deletedCoupon) {
    return next(new AppError(messages.coupon.notFound, 404));
  }

  // Send response
  return res.status(200).json({
    message: messages.coupon.deleteSuccessfully,
    success: true,
    data: deletedCoupon,
  });
};