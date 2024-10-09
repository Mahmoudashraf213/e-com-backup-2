import { Cart, Product } from "../../../db/index.js";
import { AppError } from "../../utils/appError.js";
import { messages } from "../../utils/constant/messages.js";

// add and update cart
export const addToCart = async (req, res, next) => {
  // Get data from request
  const { productId, quantity } = req.body;
  const user = req.authUser._id;

  // Check if the product exists
  const productExist = await Product.findById(productId);
  if (!productExist) {
    return next(new AppError(messages.product.notFound, 404));
  }

  // Check if the product is in stock
  if (!productExist.inStock(quantity)) {
    return next(new AppError("Out of stock", 400));
  }

  // Try to update the quantity if the product already exists in the cart
  const productExistInCart = await Cart.findOneAndUpdate(
    { user, "products.productId": productId },
    { $set: { "products.$.quantity": quantity } },
    { new: true }
  );

  if (!productExistInCart) {
    // If the product does not exist in the cart, add it
    const addedProduct = await Cart.findOneAndUpdate(
      { user },
      { $push: { products: { productId, quantity } } },
      { new: true, upsert: true } 
    );

    // Send response
    return res.status(200).json({ message: "Added to cart successfully", success: true, data: addedProduct });
  }

  // Send response if the product quantity was updated
  return res.status(200).json({ message: "Cart updated successfully", success: true, data: productExistInCart });
};

// get all carts
export const getAllCarts = async (req, res, next) => {
  try {
    const carts = await Cart.find().populate("user", "username email").populate("products.productId", "name price");

    if (!carts) {
      return next(new AppError("No carts found", 404));
    }

    // Send response
    return res.status(200).json({ 
      message:messages.cart.getAllSuccessfully,
      success: true,
      length: carts.length,
      data: carts 
    });
  } catch (error) {
    return next(new AppError("Error retrieving carts", 500));
  }
};


// get specific cart
export const getSpecificCart = async (req, res, next) => {
  try {
    const userId = req.authUser._id; 

    // Find the cart for the specific user and populate product details
    const cart = await Cart.findOne({ user: userId })
      .populate("products.productId", "name price")
      .populate("user", "username email");

    // If no cart found, return an error
    if (!cart) {
      return next(new AppError(messages.cart.notFound, 404));
    }

    // Send response with cart details
    return res.status(200).json({
      message: messages.cart.getSuccessfully,
      success: true,
      data: cart
    });
  } catch (error) {
    return next(new AppError("Error retrieving cart", 500));
  }
};

// delete a cart
export const deleteCart = async (req, res, next) => {
  try {
    const userId = req.authUser._id;

    // Find and delete the cart for the specific user
    const cart = await Cart.findOneAndDelete({ user: userId });

    // If no cart found, return an error
    if (!cart) {
      return next(new AppError(messages.cart.notFound, 404));
    }

    // Send response after successful deletion
    return res.status(200).json({
      message:messages.cart.deleteSuccessfully,
      success: true
    });
  } catch (error) {
    return next(new AppError("Error deleting cart", 500));
  }
};