import { Router } from "express";
import { fileUpload } from "../../utils/multer.js";
import { isValid } from "../../middleware/vaildation.js";
import { addSubcategoryVal, deleteSubCategoryVal, updateSubcategoryVal } from "./subcategory.validation.js";
import { asyncHandler } from "../../utils/appError.js";
import { addSubcategory ,deleteSubcategory,getSubcategory, subcategoryById, updateSubcategory} from "./subcategory.contoller.js";
import { cloudUploads } from "../../utils/multer-cloud.js";

const subcategoryRouter = Router();

// add subcategory todo authentication auth
subcategoryRouter.post("/",
  cloudUploads().single('image'),
  isValid(addSubcategoryVal),
  asyncHandler(addSubcategory)
)


subcategoryRouter.put('/:subcategoryId',
  cloudUploads().single('image'),
  isValid(updateSubcategoryVal),
  asyncHandler(updateSubcategory)
);

// get subcategory 
subcategoryRouter.get('/:categoryId',asyncHandler(getSubcategory))

// get specific subcategory
subcategoryRouter.get('/specific/:subcategoryId', asyncHandler(subcategoryById))
export default subcategoryRouter;

// delete subcategory todo authentcation,auth
subcategoryRouter.delete('/:subcategoryId', isValid(deleteSubCategoryVal), asyncHandler(deleteSubcategory))
