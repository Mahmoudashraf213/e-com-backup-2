import joi from 'joi';
import { generalFields } from '../../middleware/vaildation.js';

export const addBrandVal = joi.object({
    name: generalFields.name.required(),
})

export const updateBrandVal = joi.object({
  name : generalFields.name,
  brandId: generalFields.objectId.required()
})

// Validation schema for deleting a brand
export const deleteBrandVal = joi.object({
  brandId: joi.string().length(24).hex().required().messages({
    'string.length': 'Invalid brand ID format',
    'string.hex': 'Invalid brand ID format',
    'any.required': 'Brand ID is required',
  }),
});