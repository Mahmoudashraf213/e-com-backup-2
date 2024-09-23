import { Router } from "express";
import { isAuthenticated } from "../../middleware/authentication.js";
import { isAuthorized } from "../../middleware/autheraization.js";
import { roles } from "../../utils/constant/enums.js";
import { asyncHandler } from "../../utils/appError.js";
import { addToWishList } from "./wishlist.contoller.js";

const wishlistRouter = Router()

// add to wishlist
wishlistRouter.post('/:productId',
  isAuthenticated(),
  isAuthorized([roles.USER, roles.ADMIN]),
  asyncHandler(addToWishList)
)
export default wishlistRouter 