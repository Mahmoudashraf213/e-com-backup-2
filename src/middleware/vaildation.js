// import modules
import joi from "joi";
import { AppError } from "../utils/appError.js";
import { discountTypes } from "../utils/constant/enums.js";

const parseArray = (value, helper) => {
  let data = JSON.parse(value);
  let schema = joi.array().items(joi.string());
  const { error } = schema.validate(data);
  if (error) {
    return helper(error.details);
  }
  return true;
};
export const generalFields = {
  name: joi.string(),
  description: joi.string().max(2000),
  objectId: joi.string().hex().length(24),
  stock: joi.number().positive(),
  price: joi.number().positive(),
  discount: joi.number(),
  colors: joi.custom(parseArray),
  sizes: joi.custom(parseArray),
  rate: joi.number().min(1).max(5),
  discountType: joi.string().valid(...Object.values(discountTypes)),
  email: joi.string().email(),
  phone:joi.string().pattern(new RegExp(/^(00201|\+201|01)[0-2,5]{1}[0-9]{8}$/)),
  password: joi.string().pattern(new RegExp(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/)),
  cpassword: joi.string().valid(joi.ref("password")),
  status: joi.string().valid("pending", "verified", "blocked"),
  DOB: joi.string(),
};

// Define a schema using generalFields or another schema you need
// const schema = joi.object(generalFields);

export const isValid = (schema) => {
  return (req, res, next) => {
    let data = { ...req.body, ...req.params, ...req.query }; // Corrected from 'date' to 'data'
    const { error } = schema.validate(data, { abortEarly: false }); // Corrected from 'errro' to 'error'
    if (error) {
      const errArr = [];
      error.details.forEach((err) => {
        errArr.push(err.message);
      });
      return next(new AppError(errArr, 400));
    }
    next();
  };
};
