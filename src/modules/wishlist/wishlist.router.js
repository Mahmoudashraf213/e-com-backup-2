import { Router } from "express";
import { isAuthenticated } from "../../middleware/authentication.js";
import { isAuthorized } from "../../middleware/autheraization.js";
import { roles } from "../../utils/constant/enums.js";
import { asyncHandler } from "../../utils/appError.js";
import { addToWishList, deleteFromWishList, getAllWishList } from "./wishlist.contoller.js";

const wishlistRouter = Router()

// add and update to wishlist
wishlistRouter.post('/:productId',
  isAuthenticated(),
  isAuthorized([roles.USER, roles.ADMIN]),
  asyncHandler(addToWishList)
)

// get all wishlist
wishlistRouter.get('/',
  isAuthenticated(),
  isAuthorized([roles.USER, roles.ADMIN]),
  asyncHandler(getAllWishList)
)

// Delete an item from the wishlist
wishlistRouter.delete('/:productId',
  isAuthenticated(), 
  isAuthorized([roles.USER, roles.ADMIN]), 
  asyncHandler(deleteFromWishList) 
);
export default wishlistRouter 