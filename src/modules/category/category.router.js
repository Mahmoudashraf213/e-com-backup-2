import {Router} from 'express';
import { isValid } from '../../middleware/vaildation.js';
import { addCategoryVal, updateCategoryVal } from './category.validation.js';
import { asyncHandler } from '../../utils/appError.js';
import { addCategory , updateCategory,getCategories, getCategory, deleteCategory } from './category.controller.js';
import { cloudUploads } from '../../utils/multer-cloud.js';
const categoryRouter = Router()

// add category todo authentication & auth
categoryRouter.post('/',
  cloudUploads().single('image'),
  isValid(addCategoryVal),
  asyncHandler(addCategory)

)
// update category todo authentication autherazation 
categoryRouter.put('/:categoryId',
  cloudUploads({}).single('image'),
  isValid(updateCategoryVal),
  asyncHandler(updateCategory)
)

// get all categories
categoryRouter.get('/',asyncHandler(getCategories))

// Get specific category by ID
categoryRouter.get('/:categoryId', asyncHandler(getCategory));

// Route to delete a category and its image
categoryRouter.delete('/:categoryId', asyncHandler(deleteCategory));

export default categoryRouter;

