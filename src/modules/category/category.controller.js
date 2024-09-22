import slugify from "slugify";
import mongoose from "mongoose";
import { Category } from "../../../db/models/category.model.js";
import { AppError } from "../../utils/appError.js";
import { messages } from "../../utils/constant/messages.js";
// import { deleteFile } from "../../utils/file-functions.js";
import cloudinary from "../../utils/cloud.js";

// add Category
export const addCategory = async (req, res, next) => {
  // get data from req
  let { name } = req.body;
  name = name.toLowerCase();

  // check if category exists
  const categoryExist = await Category.findOne({ name });
  if (categoryExist) {
    return next(new AppError(messages.category.alreadyExist, 409));
  }

  // upload image to cloudinary
  const { secure_url, public_id } = await cloudinary.uploader.upload(
    req.file.path,
    {
      folder: "hti-g1/category",  // Folder path on cloudinary
    }
  );

  // prepare the category object
  const slug = slugify(name);
  const category = new Category({
    name,
    slug,
    image: { secure_url, public_id },
    createdBy: req.authUser._id
  });

  // add to database
  const createdCategory = await category.save();
  if (!createdCategory) {
    // rollback on failure
    req.failImage = { secure_url, public_id };  // Store image details for cleanup if needed
    return next(new AppError(messages.category.failToCreate, 500));
  }

  // send response
  return res.status(201).json({
    message: messages.category.createCategory,
    success: true,
    data: createdCategory,
  });
};


// update Category
export const updateCategory = async (req, res, next) => {
  // get data from req
  let { name } = req.body;
  const { categoryId } = req.params;
  name = name.toLowerCase();

  // check if category exists
  const categoryExist = await Category.findById(categoryId);
  if (!categoryExist) {
    return next(new AppError(messages.category.notFound, 404));
  }

  // check if name already exists
  const nameExist = await Category.findOne({ name, _id: { $ne: categoryId } });
  if (nameExist) {
    return next(new AppError(messages.category.alreadyExist, 409));
  }

  // update name and slug if name is provided
  if (name) {
    const slug = slugify(name);
    categoryExist.name = name;
    categoryExist.slug = slug;
    categoryExist.updatedBy = req.authUser._id
  }
  

  // upload and update image if file is provided
  if (req.file) {
    // upload new image to cloudinary (no deletion of the old image)
    const { secure_url, public_id } = await cloudinary.uploader.upload(req.file.path, {
      folder: "hti-g1/category",  // Folder path on Cloudinary
    });

    // update the image details
    categoryExist.image = { secure_url, public_id };
    req.failImage = { secure_url, public_id };  // Store image details for rollback if necessary
  }

  // save updated category to database
  const updatedCategory = await categoryExist.save();
  if (!updatedCategory) {
    return next(new AppError(messages.category.failToUpdate, 500));
  }

  // send response
  return res.status(200).json({
    message: messages.category.updateSuccessfully,
    success: true,
    data: updatedCategory,
  });
};

// getCategories
export const getCategories = async (req, res, next) => {
  try {
    // Use aggregate to fetch categories and their related subcategories
    const categories = await Category.aggregate([
      {
        $lookup: {
          from: 'subcategories',
          localField: '_id',
          foreignField: 'category',
          as: 'subcategories'
        }
      }
    ]);

    // Return the categories with Cloudinary image URLs
    return res.status(200).json({ success: true, data: categories });
  } catch (error) {
    return next(new AppError(messages.category.failToFetch, 500));
  }
};

// Get specific category by ID
export const getCategory = async (req, res, next) => {
  const { categoryId } = req.params;

  try {
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
      return next(new AppError('Invalid category ID', 400));
    }

    // Fetch category
    const category = await Category.findById(categoryId);
    if (!category) {
      return next(new AppError('Category not found', 404));
    }

    // Get image URL from Cloudinary
    const imageUrl = category.image.public_id
      ? cloudinary.url(category.image.public_id, { secure: true })
      : null;

    // Send response
    return res.status(200).json({
      success: true,
      data: {
        ...category.toObject(),
        image: { ...category.image, url: imageUrl }
      }
    });
  } catch (error) {
    console.error('Error fetching category:', error);
    return next(new AppError('Failed to fetch category', 500));
  }
};


// Delete category and its image
export const deleteCategory = async (req, res, next) => {
  const { categoryId } = req.params;

  try {
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
      return next(new AppError('Invalid category ID', 400));
    }

    // Find category
    const category = await Category.findById(categoryId);
    if (!category) {
      return next(new AppError('Category not found', 404));
    }

    // Delete image from Cloudinary
    if (category.image.public_id) {
      await cloudinary.uploader.destroy(category.image.public_id);
    }

    // Delete category from database
    await Category.findByIdAndDelete(categoryId);

    // Send response
    return res.status(200).json({
      success: true,
      message: 'Category and its image deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting category:', error);
    return next(new AppError('Failed to delete category', 500));
  }
};

