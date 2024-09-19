import { Router } from "express";
import { cloudUploads } from "../../utils/multer-cloud.js";
import { isValid } from "../../middleware/vaildation.js";
import { addProductVal } from "./product.validation.js";
import { asyncHandler } from "../../utils/appError.js";
import { addProduct, getAllProducts } from "./product.controller.js";

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
  // get product
productRouter.get('/', asyncHandler(getAllProducts))

export default productRouter;
