import slugify from "slugify";
import { Brand } from "../../../db/index.js";
import { AppError } from "../../utils/appError.js";
import { messages } from "../../utils/constant/messages.js";
import cloudinary, { deleteCloudImage } from "../../utils/cloud.js";
import { ApiFeature } from "../../utils/apiFeatures.js";

// add Brand  
export const addBrand = async (req, res, next) => {
  // get data from db
  let { name } = req.body;
  name = name.toLowerCase();
  // check existence
  const brandExists = await Brand.findOne({ name });
  if (brandExists) {
    return next(new AppError(messages.brand.alreadyExist, 409));
  }
  // prepare obj
  // upload image
  const { secure_url, public_id } = await cloudinary.uploader.upload(
    req.file.path,
    {
      folder: "hti-g1/brand",
    }
  );
  const slug = slugify(name);
  const brand = new Brand({
    name,
    slug,
    logo: { secure_url, public_id },
    createdBy: req.authUser._id 
  });
  // add to db
  const createBrand = await brand.save();
  if (!createBrand) {
    // rollback
    req.failImage = { secure_url, public_id };
    return next(new AppError(messages.brand.failToCreate, 500));
  }
  // send response
  return res.status(201).json({
    message: messages.brand.createSuccessfully,
    success: true,
    data: createBrand,
  });
};

// update brand
export const updateBrand = async (req, res, next) => {
  // get data from req
  let { name } = req.body;
  const { brandId } = req.params;
  name = name.toLowerCase();
  // check existence
  const barndExist = await Brand.findById(brandId);
  if (!barndExist) {
    return next(new AppError(messages.brand.notFound, 404));
  }
  // check name existence
  const nameExist = await Brand.findOne({ name, _id: { $ne: brandId } });
  if (nameExist) {
    return next(new AppError(messages.brand.alreadyExist, 409));
  }
  // prepare data
  if (name) {
    const slug = slugify(name);
    barndExist.name = name
    barndExist.slug = slug
    barndExist.updatedBy = req.authUser._id
  }
  // upload image
  if (req.file) {
    // delete old data
    // await cloudinary.uploader.destroy(barndExist.logo.public_id);
    // upload new image
    let { secure_url, public_id } = await cloudinary.uploader.upload(req.file.path,{
      public_id:barndExist.logo.public_id 
    })
    barndExist.logo={ secure_url, public_id } 
    req.failImage={ secure_url, public_id } 

  }
  // update to db
  const updatedBrand = await barndExist.save()
  if (!updatedBrand) {
    return next (new AppError(messages.brand.failToUpdate))
  }
  // send response
  return res.status(200).json({
    message: messages.brand.updateSuccessfully,
    success:true,
    date: updatedBrand
  })
};

// get all brand
export const getAllBrand = async (req, res, next) => {
  // get data from req params or query
  const apiFeature = new ApiFeature(
    Brand.find(),  // Replace with actual path if you need to populate related data
    req.query
  )
    .pagination()
    .sort()
    .select()
    .filter();
  
  // Execute the query
  const brands = await apiFeature.mongooseQuery;

  // Send response
  return res.status(200).json({
    success: true,
    data: brands,
  });
};

// get specific brand by ID
export const getSpecificBrand = async (req, res, next) => {
  try {
    const { brandId } = req.params;

    // Fetch the brand without population
    const brand = await Brand.findById(brandId);

    if (!brand) {
      return next(new AppError(messages.brand.notFound, 404));
    }

    return res.status(200).json({
      success: true,
      data: brand,
    });
  } catch (error) {
    return next(new AppError(messages.brand.failToGet, 500));
  }
};

// delete brand
export const deleteBrand = async (req, res, next) => {
  // get data from req
  const { brandId } = req.params;

  // check if brand exists
  const brand = await Brand.findById(brandId);
  if (!brand) {
    return next(new AppError(messages.brand.notFound, 404));
  }

  // check if image exists and delete the image from Cloudinary
  if (brand.logo && brand.logo.public_id) {
    await deleteCloudImage(brand.logo.public_id);
  }

  // delete brand
  await Brand.findByIdAndDelete(brandId);

  // send response
  return res.status(200).json({
    message: messages.brand.deleted,
    success: true,
  });
};

