import { Router } from "express";
import { fileUpload } from "../../utils/multer.js";
import { isValid } from "../../middleware/vaildation.js";
import { addSubcategoryVal, deleteSubCategoryVal, updateSubcategoryVal } from "./subcategory.validation.js";
import { asyncHandler } from "../../utils/appError.js";
import { addSubcategory ,deleteSubcategory,getSubcategory, subcategoryById, updateSubcategory} from "./subcategory.contoller.js";
import { isAuthenticated } from "../../middleware/authentication.js";
import { isAuthorized } from "../../middleware/autheraization.js";
import { cloudUploads } from "../../utils/multer-cloud.js";
import { roles } from "../../utils/constant/enums.js";

const subcategoryRouter = Router();

// add subcategory 
subcategoryRouter.post("/",
  isAuthenticated(),
  isAuthorized([roles.ADMIN, roles.SELLER]),
  cloudUploads().single('image'),
  isValid(addSubcategoryVal),
  asyncHandler(addSubcategory)
)


subcategoryRouter.put('/:subcategoryId',
  isAuthenticated(),
  isAuthorized([roles.ADMIN]),
  cloudUploads().single('image'),
  isValid(updateSubcategoryVal),
  asyncHandler(updateSubcategory)
);

// get subcategory 
subcategoryRouter.get('/:categoryId',asyncHandler(getSubcategory))

// get specific subcategory
subcategoryRouter.get('/specific/:subcategoryId', asyncHandler(subcategoryById))
export default subcategoryRouter;

// delete subcategory 
subcategoryRouter.delete('/:subcategoryId',
  isAuthenticated(),
  isAuthorized([roles.ADMIN]), 
  isValid(deleteSubCategoryVal),
  asyncHandler(deleteSubcategory)
)
