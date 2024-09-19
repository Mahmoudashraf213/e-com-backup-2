import { Router } from "express";
import { cloudUploads } from "../../utils/multer-cloud.js";
import { isValid } from "../../middleware/vaildation.js";
import { addProductVal, updateProductVal } from "./product.validation.js";
import { asyncHandler } from "../../utils/appError.js";
import { addProduct, getAllProducts, updateProduct } from "./product.controller.js";

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

// update product  todo authentcation & autherizaton
productRouter.put('/:productId',
  cloudUploads().fields([{ name: 'mainImage', maxCount: 1 }, { name: 'subImages', maxCount: 10 }]),
  isValid(updateProductVal),
  asyncHandler(updateProduct)
)

  // get product
productRouter.get('/', asyncHandler(getAllProducts))

export default productRouter;
