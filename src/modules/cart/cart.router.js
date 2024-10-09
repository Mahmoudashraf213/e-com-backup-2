import { Router } from "express";
import { isAuthenticated } from "../../middleware/authentication.js";
import { isAuthorized } from "../../middleware/autheraization.js";
import { roles } from "../../utils/constant/enums.js";
import { asyncHandler } from "../../utils/appError.js";
import { addToCart, deleteCart, getAllCarts, getSpecificCart } from "./cart.controller.js";
import { isValid } from "../../middleware/vaildation.js";
import { addToCartVal } from "./cart.validation.js";
const cartRouter = Router()

// add cart
cartRouter.put('/',
  isAuthenticated(),
  isAuthorized([roles.USER, roles.ADMIN]),
  isValid(addToCartVal),
  asyncHandler(addToCart)
)

// Get all carts route
cartRouter.get('/',
  isAuthenticated(),
  isAuthorized([roles.ADMIN]), 
  asyncHandler(getAllCarts)
);

// Get specific cart
cartRouter.get('/get',
  isAuthenticated(), 
  isAuthorized([roles.ADMIN]),
  asyncHandler(getSpecificCart)
);

// Delete specific cart
cartRouter.delete('/',
  isAuthenticated(), 
  isAuthorized([roles.ADMIN]),
  asyncHandler(deleteCart)
);
export default cartRouter