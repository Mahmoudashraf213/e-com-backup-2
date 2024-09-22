import { Router } from "express";
import { cloudUploads } from "../../utils/multer-cloud.js";
import { isValid } from "../../middleware/vaildation.js";
import { addBrandVal, deleteBrandVal, updateBrandVal } from "./brand.validation.js";
import { asyncHandler } from "../../utils/appError.js";
import { addBrand, deleteBrand, getAllBrand, getSpecificBrand, updateBrand } from "./brand.controller.js";
import { isAuthenticated } from "../../middleware/authentication.js";
import { isAuthorized } from "../../middleware/autheraization.js";
import { roles } from "../../utils/constant/enums.js";

const brandRouter = Router()
// add brand 
brandRouter.post('/',
  isAuthenticated(),
  isAuthorized([roles.ADMIN, roles.SELLER]),
  cloudUploads().single('logo'),
  isValid(addBrandVal),
  asyncHandler(addBrand)
)

// update brand 
brandRouter.put('/:brandId',
  isAuthenticated(),
  isAuthorized([roles.ADMIN]),
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