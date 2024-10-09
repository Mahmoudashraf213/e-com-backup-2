import { Product, Review } from "../../../db/index.js";
import { AppError } from "../../utils/appError.js";
import { messages } from "../../utils/constant/messages.js";

// add review 
export const addReview = async (req, res, next) => {
  // get data from req
  const { comment, rate } = req.body;
  const { productId } = req.params;
  const userId = req.authUser._id;
  // ckeck user existence
  const productExist = await Product.findById(productId);
  if (!productExist) {
    return next(new AppError(messages.product.notExist, 404));
  }
  // todo check if user has any orders on this product
  // prepare data
  // check if review
  const reviewExist = await Review.findOneAndUpdate(
    { user: userId, product: productId },
    { rate, comment },
    {new :true}
  );
  let data = reviewExist
  if (!reviewExist) {
    const review = new Review({
      user: userId,
      product: productId,
      comment,
      rate,
      isVerified: false, // todo true ? order on this product
    });
    // add to db
    const createdReview = await review.save();
    if (!createdReview) {
      return next(new AppError(messages.review.failToCreate, 500));
    }
    data = createdReview 
  }
  // update product rata
  const reviews = await Review.find({ product: productId });
  let finalRate = reviews.reduce((acc, cur) => {
    return (acc += cur.rate);
  }, 0);
  finalRate /= reviews.length;
  await Product.findByIdAndUpdate(productId, { rate: finalRate });
  // send response
  res.status(201).json({
    message: messages.review.createSuccessfully,
    success: true,
    data,
  });
};


// update review 
export const updateReview = async (req, res, next) => {
  // Get data from req
  const { comment, rate } = req.body;
  const { productId, reviewId } = req.params;
  const userId = req.authUser._id;

  // Check product existence
  const productExist = await Product.findById(productId);
  if (!productExist) {
    return next(new AppError(messages.product.notExist, 404));
  }

  // Check if the review exists and belongs to the user
  const reviewExist = await Review.findOne({
    _id: reviewId,
    user: userId,
    product: productId,
  });

  if (!reviewExist) {
    return next(new AppError(messages.review.notExist, 404));
  }

  // Update the review
  reviewExist.comment = comment || reviewExist.comment;
  reviewExist.rate = rate || reviewExist.rate;

  const updatedReview = await reviewExist.save();
  if (!updatedReview) {
    return next(new AppError(messages.review.failToUpdate, 500));
  }

  // Update product rate
  const reviews = await Review.find({ product: productId });
  let finalRate = reviews.reduce((acc, cur) => (acc += cur.rate), 0);
  finalRate /= reviews.length;
  await Product.findByIdAndUpdate(productId, { rate: finalRate });

  // Send response
  res.status(200).json({
    message: messages.review.updateSuccessfully,
    success: true,
    data: updatedReview,
  });
};

// get all review 
export const getAllReviews = async (req, res, next) => {
  const { productId } = req.params;

  // Check if there are reviews for the product
  const reviews = await Review.find({ product: productId }).populate('user', 'firstName lastName');

  if (!reviews || reviews.length === 0) {
    return next(new AppError(messages.review.notFound, 404));
  }

  // Send response
  res.status(200).json({
    message: messages.review.getAllSuccessfully,
    success: true,
    length: reviews.length ,
    data: reviews,
  });
};

export const getSpecificReview = async (req, res, next) => {
  const { productId, reviewId } = req.params;

  // Find the specific review
  const review = await Review.findOne({
    _id: reviewId,
    product: productId
  }).populate('user', 'firstName lastName');

  if (!review) {
    return next(new AppError(messages.review.notExist, 404));
  }

  // Send response
  res.status(200).json({
    message: messages.review.getSuccessfully,
    success: true,
    data: review,
  });
};

// delete review 
export const deleteReview = async (req, res, next) => {
  const { productId, reviewId } = req.params;
  const userId = req.authUser._id;

  // Find the review to delete
  const review = await Review.findOne({ _id: reviewId, product: productId });

  if (!review) {
    return next(new AppError(messages.review.notExist, 404));
  }

  // Ensure that the user deleting the review is the owner or an admin
  if (review.user.toString() !== userId.toString() && req.authUser.role !== 'admin') {
    return next(new AppError(messages.review.unauthorized, 403));
  }

  // Delete the review
  const deletedReview = await Review.findByIdAndDelete(reviewId);

  if (!deletedReview) {
    return next(new AppError(messages.review.failToDelete, 500));
  }

  // Update the product's rate after deleting the review
  const reviews = await Review.find({ product: productId });
  let finalRate = 0;
  if (reviews.length > 0) {
    finalRate = reviews.reduce((acc, cur) => (acc += cur.rate), 0) / reviews.length;
  }
  
  await Product.findByIdAndUpdate(productId, { rate: finalRate });

  // Send response
  res.status(200).json({
    message: messages.review.deleteSuccessfully,
    success: true,
  });
};