import joi from 'joi'
import { generalFields } from '../../middleware/vaildation.js'


export const addSubcategoryVal = joi.object({
  name:generalFields.name.required(),
  category:generalFields.objectId.required(),
})

export const updateSubcategoryVal = joi.object({
  name: generalFields.name,
  subcategoryId: generalFields.objectId.required(),
});

export const deleteSubCategoryVal = joi.object({
  subcategoryId: generalFields.objectId.required()
})