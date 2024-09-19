import slugify from "slugify";
import mongoose from "mongoose";
import { Category } from "../../../db/models/category.model.js";
import { Subcategory } from "../../../db/models/subcategory.model.js";
// import { Category, Subcategory } from "../../../DB/index.js";
import { AppError } from "../../utils/appError.js";
import { messages } from "../../utils/constant/messages.js";
import cloudinary, { deleteCloudImage } from "../../utils/cloud.js";
import { ApiFeature } from "../../utils/apiFeatures.js";

// Add subcategory
export const addSubcategory = async (req, res, next) => {
  let { name, category } = req.body;
  name = name.toLowerCase();

  // Check if file is provided
  if (!req.file) {
    return next(new AppError(messages.file.required, 400));
  }

  // Check if category exists
  const categoryExist = await Category.findById(category);
  if (!categoryExist) {
    return next(new AppError(messages.category.notFound, 404));
  }

  // Check if subcategory name already exists within the category
  const nameExist = await Subcategory.findOne({ name, category });
  if (nameExist) {
    return next(new AppError(messages.subcategory.alreadyExist, 409));
  }

  // Upload image to Cloudinary
  const { secure_url, public_id } = await cloudinary.uploader.upload(
    req.file.path,
    {
      folder: "hti-g1/subcategories",
    }
  );

  // Prepare the subcategory object
  const slug = slugify(name);
  const subcategory = new Subcategory({
    name,
    slug,
    category,
    image: { secure_url, public_id },
  });

  // Save to database
  const createdSubcategory = await subcategory.save();
  if (!createdSubcategory) {
    // Rollback on failure
    await cloudinary.uploader.destroy(public_id); // Clean up uploaded image
    return next(new AppError(messages.subcategory.failToCreate, 500));
  }

  // Send response
  return res.status(201).json({
    message: messages.subcategory.createSuccessfully,
    success: true,
    data: createdSubcategory,
  });
};

// Update Subcategory
export const updateSubcategory = async (req, res, next) => {
  try {
    let { name, category } = req.body;
    const { subcategoryId } = req.params;

    // Check if subcategory exists
    const subcategoryExist = await Subcategory.findById(subcategoryId);
    if (!subcategoryExist) {
      return next(new AppError(messages.subcategory.notExist, 404));
    }

    // Check if category exists
    if (category) {
      const categoryExist = await Category.findById(category);
      if (!categoryExist) {
        return next(new AppError(messages.category.notExist, 404));
      }
    }

    // Check if name already exists
    if (name && name !== subcategoryExist.name) {
      const nameExist = await Subcategory.findOne({
        name: name.toLowerCase(),
        _id: { $ne: subcategoryId },
      });
      if (nameExist) {
        return next(new AppError(messages.subcategory.alreadyExist, 409));
      }
      subcategoryExist.name = name.toLowerCase();
      subcategoryExist.slug = slugify(name);
    }

    // Handle image update
    if (req.file) {
      if (subcategoryExist.image && subcategoryExist.image.public_id) {
        // Delete the old image from Cloudinary
        await cloudinary.uploader.destroy(subcategoryExist.image.public_id);
      }

      // Upload new image to Cloudinary
      const { secure_url, public_id } = await cloudinary.uploader.upload(
        req.file.path,
        {
          folder: "hti-g1/subcategories",
        }
      );

      // Update the subcategory image with the new Cloudinary data
      subcategoryExist.image = { secure_url, public_id };
    }

    // Save the updated subcategory to the database
    const updatedSubcategory = await subcategoryExist.save();
    if (!updatedSubcategory) {
      return next(new AppError(messages.subcategory.failToUpdate, 500));
    }

    // Send response
    return res.status(200).json({
      message: messages.subcategory.updatedSuccessfully,
      success: true,
      data: updatedSubcategory,
    });
  } catch (error) {
    next(error);
  }
};

// get subcategory
export const getSubcategory = async (req, res, next) => {
  // get data from req
  const { categoryId } = req.params;
  const apiFeature = new ApiFeature(
    Subcategory.find({ category: categoryId }).populate([{ path: "category" }]),req.query)
    .pagination()
    .sort()
    .select()
    .filter();
  const subcategorys = await apiFeature.mongooseQuery;
  // send res
  return res.status(200).json({
    success: true,
    data: subcategorys,
  });
};

// get specific subcategory
export const subcategoryById = async (req, res, next) => {
  // get data from req
  const { subcategoryId } = req.params;
  const subcategory = await Subcategory.findById(subcategoryId).populate([{ path: "category" },
  ]);
  // check if subcategory exists
  if (!subcategory) {
    return next(new AppError(messages.subcategory.notExist, 404));
  }
  // send res
  return res.status(200).json({
    success: true,
    data: subcategory,
  });
};

//delete subcategory cloud
export const deleteSubcategory = async (req, res, next) => {
      // get data from req
      const { subcategoryId } = req.params
      // check if subcategory exists
      const subcategory = await Subcategory.findById(subcategoryId)
      if (!subcategory) {
          return next(new AppError(messages.subcategory.notExist, 404))
      }
      // check if image exists and delete the image file
      if (subcategory.image && subcategory.image.public_id) {
          await deleteCloudImage(subcategory.image.public_id)
      }
      // delete 
      await Subcategory.findByIdAndDelete(subcategoryId)
      // send res
      return res.status(200).json({
          message: messages.subcategory.deleted,
          success: true
      })
}