import { Cart, Product } from "../../../db/index.js";
import { AppError } from "../../utils/appError.js";
import { messages } from "../../utils/constant/messages.js";

export const addToCart = async (req, res, next) => {
  // get data from req
  const { productId, quantity } = req.body;
  // check product
  const prdouctExist = await Product.findById( productId );
  if (!prdouctExist) {
    return next(new AppError(messages.product.notFound, 404));
  }
  if (!prdouctExist.inStock(quantity)) {
    return next(new AppError("out of stock", 400));
  }
  let data= ''; 
  const ProductExistInCart = await Cart.findOneAndUpdate(
    { user: req.authUser._id ,"products.productId": productId},
    {"products.$.quantity": quantity},
    {new: true}
  );
  data = ProductExistInCart
  if (!ProductExistInCart) {
  const addedProduct =  await Cart.findOneAndUpdate({ user: req.authUser._id},{
      $push:{ products: { productId, quantity}}
    },{new:true})
    data = addedProduct
  }
  // send response
  return res.status(200).json({message:"add to cart successfully",success:true,data})

};
