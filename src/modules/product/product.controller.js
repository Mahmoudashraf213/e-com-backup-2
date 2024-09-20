import slugify from "slugify";
import mongoose from 'mongoose';
import { Brand, Product, Subcategory } from "../../../db/index.js";
import { AppError } from "../../utils/appError.js";
import { messages } from "../../utils/constant/messages.js";
import cloudinary from "../../utils/cloud.js";
import { ApiFeature } from "../../utils/apiFeatures.js";
import { deleteFile } from "../../utils/file-functions.js";
import { deleteCloudImage } from "../../utils/cloud.js";


// Add Product
export const addProduct = async (req, res, next) => {
  try {
    // Get data from req
    const {
      name,
      description,
      stock,
      price,
      discount,
      discountType,
      colors,
      sizes,
      category,
      subcategory,
      brand,
    } = req.body;

    // Check existence
    // 1- Brand exists
    const brandExists = await Brand.findById(brand);
    if (!brandExists) {
      return next(new AppError(messages.brand.notFound, 404));
    }

    // 2- Subcategory exists
    const subcategoryExist = await Subcategory.findById(subcategory);
    if (!subcategoryExist) {
      return next(new AppError(messages.subcategory.notFound, 404));
    }

    // Check if product with the same name exists
    const existingProduct = await Product.findOne({ name: slugify(name) });
    if (existingProduct) {
      return next(new AppError(messages.product.alreadyExists, 409));
    }

    // Handle image upload
    let mainImage = { secure_url: '', public_id: '' };
    if (req.files.mainImage) {
      // Upload main image
      const { secure_url, public_id } = await cloudinary.uploader.upload(
        req.files.mainImage[0].path,
        { folder: "hti-g1/products/main-images" }
      );
      mainImage = { secure_url, public_id };
      req.failImages = [public_id];
    }

    let subImages = [];
    if (req.files.subImages) {
      // Upload sub images
      for (const file of req.files.subImages) {
        const { secure_url, public_id } = await cloudinary.uploader.upload(
          file.path,
          { folder: "hti-g1/products/sub-images" }
        );
        subImages.push({ secure_url, public_id });
        req.failImages.push(public_id);
      }
    }

    // Prepare data
    const slug = slugify(name);
    const product = new Product({
      name,
      slug,
      description,
      stock,
      price,
      discount,
      discountType,
      colors: JSON.parse(colors),
      sizes: JSON.parse(sizes),
      category,
      subcategory,
      brand,
      mainImage,
      subImages,
      // TODO: createBy, updatedBy tokens
    });

    // Add to db
    const createdProduct = await product.save();
    if (!createdProduct) {
      // Rollback
      if (req.files.mainImage) {
        deleteFile(req.files.mainImage[0].path);
      }
      for (const public_id of req.failImages) {
        await deleteCloudImage(public_id);
      }
      return next(new AppError(messages.product.failToCreate, 500));
    }

    // Send response
    return res.status(201).json({
      message: messages.product.createSuccessfully,
      success: true,
      data: createdProduct,
    });
  } catch (error) {
    // Rollback in case of error
    if (req.files.mainImage) {
      deleteFile(req.files.mainImage[0].path);
    }
    if (req.failImages?.length > 0) {
      for (const public_id of req.failImages) {
        await deleteCloudImage(public_id);
      }
    }
    return next(new AppError(error.message, error.statusCode || 500));
  }
};
// get product 
// pagination sort select filter
export const getAllProducts = async (req, res, next) => {
  // let { page, size, sort, select, ...filter } = req.query;
  // console.log(filter);
  // filter = JSON.parse(JSON.stringify(filter).replace(/'gte|gt|lte|lt'/g,match =>  ));

  // if (!page || page <= 0) {
  //   page = 1;
  // }
  // if (!size || size <= 0) {
  //   size = 3;
  // }
  // let skip = (page - 1) * size;
  // sort = sort?.replaceAll(',',' ')
  // select = select?.replaceAll(',',' ')

  // const mongooseQuery = await Product.find(filter)
  // mongooseQuery.limit(size).skip(skip)
  // mongooseQuery.sort(sort)
  // mongooseQuery.select(select)
  // const product = await mongooseQuery
  const apiFeature = new ApiFeature(Product.find(), req.query).pagination().sort().select().filter()
  const products = await apiFeature.mongooseQuery

  return res.status(200).json({ success: true, data: products });
};


// update product
export const updateProduct = async (req, res, next) => {
  // get data from req
  const {
      name,
      price,
      description,
      stock,
      discount,
      discountType,
      colors,
      sizes,
      brand,
      category,
      subcategory,
  } = req.body;
  // console.log(req.body); // Log the request body to verify its contents
  
  const { productId } = req.params
  // check existance 
  const productExist = await Product.findById(productId)
  if (!productExist) {
      return next(new AppError(messages.product.notExist, 404))
  }
  // 1- brand 
  if (brand) {
    // const brandId = mongoose.Types.ObjectId(req.params.brandId);
    // const brandExists = await Brand.findById(brandId);
    // const brandExists = await Brand.findById(mongoose.Types.ObjectId(brandId));
      const brandExist = await Brand.findById(brand)
      if (!brandExist) {
          return next(new AppError(messages.brand.notExist, 404))
      }
  }
  // 2- subcategory 
  if (subcategory) {
      const subcategoryExist = await Subcategory.findById(subcategory)
      if (!subcategoryExist) {
          return next(new AppError(messages.subcategory.notExist, 404))
      }
  }
  // check name exist if business want 
  // updata main image 
  req.failImages = []
  if (req.files.mainImage) {
      // delete old image
      await deleteCloudImage(productExist.mainImage.public_id)
      // upload new image
      const { secure_url, public_id } = await cloudinary.uploader.upload(req.files.mainImage[0].path, {
          folder: "hti-g1/products/main-images",
          //public_id: productExist.mainImage ? productExist.mainImage.public_id : undefined  // overwrite to old image
      })
      productExist.mainImage = { secure_url, public_id }
      req.failImages.push(public_id)
  }
  // Handle sub images
  if (req.files.subImages?.length > 0) {
      // Delete old sub images
      for (const image of productExist.subImages) {
          await deleteCloudImage(image.public_id);
      }

      // Upload new sub images
      let subImages = [];
      for (const file of req.files.subImages) {
          const { secure_url, public_id } = await cloudinary.uploader.upload(file.path,
              { folder: "hti-g1/products/sub-images" });
          subImages.push({ secure_url, public_id });
          req.failImages.push(public_id);
      }
      productExist.subImages = subImages;
  }
  // prepre data
  if (name) {
      productExist.name = name
      productExist.slug = slugify(name); // Update slug if name changes
  }
  if (price) productExist.price = price;
  if (description) productExist.description = description;
  if (stock) productExist.stock = stock;
  if (discount) productExist.discount = discount;
  if (discountType) productExist.discountType = discountType;
  if (colors) {
      const parsedColors = JSON.parse(colors)
      productExist.colors = parsedColors
  }
  if (sizes) {
      const parsedSizes = JSON.parse(sizes)
      productExist.sizes = parsedSizes
  }
  if (brand) productExist.brand = brand;
  if (category) productExist.category = category;
  if (subcategory) productExist.subcategory = subcategory;
  // save to db
  const productUpdated = await productExist.save()
  // handel fail
  if (!productUpdated) {
      return next(new AppError(messages.product.failToUpdate, 500))
  }
  // send res
  res.status(200).json({
      message: messages.product.updated,
      success: true,
      data: productUpdated
  })
}
