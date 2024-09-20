import joi from 'joi'
import { generalFields } from '../../middleware/vaildation.js'


export const addSubcategoryVal = joi.object({
  name:generalFields.name.required(),
  category:generalFields.objectId.required(),
})

export const updateSubcategoryVal = joi.object({
  name: generalFields.name,
  // slug: generalFields.slug,
  subcategoryId: generalFields.objectId.required(),
  category: generalFields.objectId,
});

export const deleteSubCategoryVal = joi.object({
  subcategoryId: generalFields.objectId.required()
})