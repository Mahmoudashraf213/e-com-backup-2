import { User } from "../../../db/index.js";
import { messages } from "../../utils/constant/messages.js";

// add and updated wishlist
export const addToWishList = async (req, res, next) => {
  // get data from req
  const { productId } = req.params;
  const userId = req.authUser._id;
  // add to db
  const userUpdated = await User.findByIdAndUpdate(userId, {
    $addToSet: { wishList: productId }},
    {new : true}
  );
  return res.status(200).json({
      message: messages.wishList.updateSuccessfully,
      success: true,
      data: userUpdated.wishList,
    });
};

// Get all and specifice  wishlist items for a user
export const getAllWishList = async (req, res, next) => {
  try {
    const userId = req.authUser._id; 
    const user = await User.findById(userId).populate("wishList"); 

    if (!user) {
      return res.status(404).json({
        message: messages.user.notFound,
        success: false,
      });
    }

    return res.status(200).json({
      message: messages.wishList.getAllSuccessfully,
      success: true,
      data: user.wishList,
    });
  } catch (error) {
    next(error);
  }
};

// Delete item from wishlist
export const deleteFromWishList = async (req, res, next) => {
  try {
    const { productId } = req.params; // Get the product ID from request parameters
    const userId = req.authUser._id; // Get the user ID from the authenticated user

    // Remove the product from the wishlist
    const userUpdated = await User.findByIdAndUpdate(userId, {
      $pull: { wishList: productId } // Use $pull to remove the product from the wishlist
    }, { new: true });

    if (!userUpdated) {
      return res.status(404).json({
        message: messages.user.notFound,
        success: false,
      });
    }

    return res.status(200).json({
      message: messages.wishList.deleteSuccessfully,
      success: true,
      data: userUpdated.wishList,
    });
  } catch (error) {
    next(error);
  }
};