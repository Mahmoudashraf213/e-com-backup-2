import joi from "joi"
import { generalFields } from "../../middleware/vaildation.js"

export const signupVal = joi.object({
  name:generalFields.name.required(),
  email:generalFields.email.required(),
  phone:generalFields.phone.required(),
  password:generalFields.password.required(),
  cpassword:generalFields.cpassword.required(),
  status:generalFields.status,
  DOB: generalFields.DOB,
})

export const loginVal = joi.object({
  phone: generalFields.phone.when('email', {
      is: joi.exist(),
      then: joi.optional(),
      otherwise: joi.required()
  }),
  email: generalFields.email,
  password: generalFields.password.required(),
})