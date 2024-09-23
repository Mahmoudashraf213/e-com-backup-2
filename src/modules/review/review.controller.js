import { Product, Review } from "../../../db/index.js";
import { AppError } from "../../utils/appError.js";
import { messages } from "../../utils/constant/messages.js";

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
