import { Cart, Coupon, Order, Product } from "../../../db/index.js";
import { AppError } from "../../utils/appError.js";
import { orderStatus } from "../../utils/constant/enums.js";
import { messages } from "../../utils/constant/messages.js";

export const createOrder = async (req, res, next) => {
  // get data from request
  const { address, phone, coupon, payment } = req.body;

  // check coupon
  const couponExist = await Coupon.findOne({ code: coupon });
  if (!couponExist) {
    return next(new AppError(messages.coupon.notFound, 404));
  }
  if (couponExist.fromDate > Date.now() || couponExist.toDate < Date.now()) {
    return next(new AppError("Invalid coupon", 404));
  }

  // check cart
  const cart = await Cart.findOne({ user: req.authUser._id }).populate(
    "products.productId"
  );

  // handle case where there is no cart
  if (!cart) {
    return next(new AppError("No cart found for this user", 404));
  }

  const products = cart.products;
  if (products.length <= 0) {
    return next(new AppError("Cart is empty", 400));
  }

// check products
let orderProducts = [];
let orderPrice = 0;
for (const product of products) {
  const productExist = await Product.findById(product.productId);
  if (!productExist) {
      return next(new AppError(messages.product.notFound, 404));
  }
  if (!productExist.inStock(product.quantity)) {
      return next(new AppError("Out of stock", 400));
  }

  // Calculate final price
  let productFinalPrice = productExist.price; // Start with the base price

  // Apply discount if applicable
  if (productExist.discount && productExist.discountType === 'percentage') {
      productFinalPrice -= (productFinalPrice * productExist.discount) / 100;
  } else if (productExist.discount) {
      productFinalPrice -= productExist.discount; // Fixed amount discount
  }

  const quantity = product.quantity;

  // Log the values for debugging
  console.log(`Product ID: ${product.productId}, Price: ${productFinalPrice}, Quantity: ${quantity}`);

  const finalPrice = quantity * productFinalPrice;

  // check if finalPrice is valid
  if (isNaN(finalPrice) || finalPrice < 0) {
      return next(new AppError("Final product price is invalid", 400));
  }

  orderProducts.push({
      productId: productExist._id,
      name: productExist.name,
      price: productFinalPrice, // Use the calculated final price here
      quantity,
      finalPrice: finalPrice,
  });

  orderPrice += finalPrice; // Use finalPrice here
}

// ensure orderPrice is valid
if (isNaN(orderPrice) || orderPrice < 0) {
  return next(new AppError("Final order price is invalid", 400));
}

const order = new Order({
  user: req.authUser._id,
  products: orderProducts,
  address,
  phone,
  coupon: {
      couponId: couponExist?._id,
      code: couponExist?.code,
      discount: couponExist?.discountAmount,
  },
  status: orderStatus.PLACED,
  payment,
  orderPrice,
  finalPrice: orderPrice, // Final price of the order based on total orderPrice
});

// save order to database
const orderCreated = await order.save();
return res.status(201).json({
  message: messages.order.createSuccessfully,
  success: true,
  data: orderCreated,
})
}