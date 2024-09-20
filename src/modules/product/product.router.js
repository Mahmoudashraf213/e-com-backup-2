import { Router } from "express";
import { cloudUploads } from "../../utils/multer-cloud.js";
import { isValid } from "../../middleware/vaildation.js";
import { addProductVal, updateProductVal } from "./product.validation.js";
import { asyncHandler } from "../../utils/appError.js";
import { addProduct, getAllProducts, getProduct, updateProduct } from "./product.controller.js";

const productRouter = Router();
// add product todo authentication authorization
productRouter.post(
  "/",
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


export default productRouter;
