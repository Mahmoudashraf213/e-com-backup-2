import { Router } from "express";
import { cloudUploads } from "../../utils/multer-cloud.js";
import { isValid } from "../../middleware/vaildation.js";
import { addBrandVal, deleteBrandVal, updateBrandVal } from "./brand.validation.js";
import { asyncHandler } from "../../utils/appError.js";
import { addBrand, deleteBrand, getAllBrand, getSpecificBrand, updateBrand } from "./brand.controller.js";

const brandRouter = Router()
// add brand todo authentication authorization
brandRouter.post('/',
  cloudUploads().single('logo'),
  isValid(addBrandVal),
  asyncHandler(addBrand)
)

// update brand todo authentication authorization
brandRouter.put('/:brandId',
  cloudUploads({}).single('logo'),
  isValid(updateBrandVal),
  asyncHandler(updateBrand)
)

// get all brand
brandRouter.get('/', asyncHandler(getAllBrand))

// get specific brand
brandRouter.get('/specific/:brandId', asyncHandler(getSpecificBrand));

// Route to delete a brand by ID
brandRouter.delete('/:brandId', isValid(deleteBrandVal), asyncHandler(deleteBrand));
export default brandRouter