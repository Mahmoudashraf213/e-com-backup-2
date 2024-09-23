import { Router }  from "express";
import { isAuthenticated } from "../../middleware/authentication.js";
import { isAuthorized } from "../../middleware/autheraization.js";
import { roles } from "../../utils/constant/enums.js";
import { isValid } from "../../middleware/vaildation.js";
import { addReviewVal } from "./review.validation.js";
import { asyncHandler } from "../../utils/appError.js";
import { addReview } from "./review.controller.js";

const reviewRouter =  Router()

// add review
reviewRouter.post('/:productId',
  isAuthenticated(),
  isAuthorized([roles.USER, roles.ADMIN]),
  isValid(addReviewVal),
  asyncHandler(addReview)

)

export default reviewRouter