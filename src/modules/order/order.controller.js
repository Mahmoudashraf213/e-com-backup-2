import { Cart, Coupon, Order, Product } from "../../../db/index.js";
import { AppError } from "../../utils/appError.js";
import { orderStatus } from "../../utils/constant/enums.js";
import { messages } from "../../utils/constant/messages.js";

export const createOrder = async (req, res, next) => {
  // get data from req
  const { address, phone, coupon, payment } = req.body;
  // check coupon
  const couponExist = await Coupon.findOne({ code: coupon });
  if (!couponExist) {
    return next(new AppError(messages.coupon.notFound, 404));
  }
  if (couponExist.fromDate > Date.now() || couponExist.toDate < Date.now()) {
    return next(new AppError("invalid coupon", 404));
  }
  // check cart
  const cart = await Cart.findOne({ user: req.authUser._id }).populate(
    "products.productId"
  );
  const products = cart.products;
  if (products.length <= 0) {
    return next(new AppError("cart empty", 400));
  }
  // check product
  let orderProducts = [];
  let orderPrice = 0;
  for (const product of products) {
    const productExist = await Product.findById(product.productId);
    if (!productExist) {
      return next(new AppError(messages.product.notFound, 404));
    }
    if (!productExist.inStock(product.quantity)) {
      return next(new AppError("out of stock"));
    }
    orderProducts.push({
      productId: productExist._id,
      name: productExist.name,
      price: productExist.finalPrice,
      quantity: product.quantity,
      finalPrice: product.quantity * productExist.finalPrice,
    });
    orderPrice += product.quantity * productExist.finalPrice;
  }
  const order = Order({
    user: req.authuser._id,
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
    finalPrice : orderPrice - orderPrice * ((couponExist?.discountAmount || 0) / 100),
  });
  // save to db
  const orderCreated = await order.save();
  return res.status(201).json({
    message: messages.order.createSuccessfully,
    success : true,
    data : orderCreated
  })
};
