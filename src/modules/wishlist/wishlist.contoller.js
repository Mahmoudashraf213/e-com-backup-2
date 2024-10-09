import { User } from "../../../db/index.js";
import { messages } from "../../utils/constant/messages.js";


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
      message: messages.,
      success: true,
      data: userUpdated.wishList,
    });
};
