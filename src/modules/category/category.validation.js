// import modules
import joi from 'joi';
import { generalFields } from '../../middleware/vaildation.js';


export const addCategoryVal = joi.object({
  name:generalFields.name.required(),
})


export const updateCategoryVal = joi.object({
  name:generalFields.name,
  categoryId: generalFields.objectId.required(),
})

