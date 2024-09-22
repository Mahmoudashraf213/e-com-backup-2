import { Router } from "express";
import { cloudUploads } from "../../utils/multer-cloud.js";
import { isValid } from "../../middleware/vaildation.js";
import { addProductVal, deleteProductVal, updateProductVal } from "./product.validation.js";
import { asyncHandler } from "../../utils/appError.js";
import { addProduct, deleteProduct, getAllProducts, getProduct, updateProduct } from "./product.controller.js";
import { isAuthenticated } from "../../middleware/authentication.js";
import { isAuthorized } from "../../middleware/autheraization.js";
import { roles } from "../../utils/constant/enums.js";

const productRouter = Router();
// add product
productRouter.post(
  "/",
  isAuthenticated(),
  isAuthorized([roles.ADMIN , roles.SELLER]),
  cloudUploads({}).fields([
    { name: "mainImage", maxCount: 1 },
    { name: "subImages", maxCount: 5 },
  ]),
  isValid(addProductVal),
  asyncHandler(addProduct)
)

// Update route to include validation
productRouter.put(
  '/:productId',
  isAuthenticated(),
  isAuthorized([roles.ADMIN]),
  cloudUploads({}).fields([
    { name: 'mainImage', maxCount: 1 },
    { name: 'subImages', maxCount: 5 }
  ]),
  isValid(updateProductVal), // Middleware for validation
  asyncHandler(updateProduct) // Your updateProduct function
);

  // get product
productRouter.get('/', asyncHandler(getAllProducts))

// get specfic products  
productRouter.get('/:productId', asyncHandler(getProduct));

// Delete a product by its ID
productRouter.delete(
  '/:productId',
  isAuthenticated(),
  isAuthorized([roles.ADMIN]),
  isValid(deleteProductVal), // Apply validation
  asyncHandler(deleteProduct) // Call the deleteProduct controller
);

export default productRouter;
