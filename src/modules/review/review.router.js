import { Router }  from "express";
import { isAuthenticated } from "../../middleware/authentication.js";
import { isAuthorized } from "../../middleware/autheraization.js";
import { roles } from "../../utils/constant/enums.js";
import { isValid } from "../../middleware/vaildation.js";
import { addReviewVal, updateReviewVal } from "./review.validation.js";
import { asyncHandler } from "../../utils/appError.js";
import { addReview, updateReview, getAllReviews, getSpecificReview, deleteReview } from "./review.controller.js";

const reviewRouter =  Router()

// add review
reviewRouter.post('/:productId',
  isAuthenticated(),
  isAuthorized([roles.USER, roles.ADMIN]),
  isValid(addReviewVal),
  asyncHandler(addReview)
)

// Update review
reviewRouter.put('/:productId/:reviewId',
  isAuthenticated(),
  isAuthorized([roles.USER, roles.ADMIN]),
  isValid(updateReviewVal),
  asyncHandler(updateReview)
);

// Get all reviews for a product
reviewRouter.get('/:productId',
  isAuthenticated(),
  isAuthorized([roles.USER, roles.ADMIN]),
  asyncHandler(getAllReviews)
);

// Get a specific review for a product
reviewRouter.get('/:productId/:reviewId',
  isAuthenticated(),
  isAuthorized([roles.USER, roles.ADMIN]),
  asyncHandler(getSpecificReview)
);

// Delete a review for a product
reviewRouter.delete('/:productId/:reviewId',
  isAuthenticated(),
  isAuthorized([roles.USER, roles.ADMIN]),
  asyncHandler(deleteReview)
);

export default reviewRouter