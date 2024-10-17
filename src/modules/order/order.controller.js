import { Cart, Coupon, Order, Product } from "../../../db/index.js";
import { AppError } from "../../utils/appError.js";
import { orderStatus } from "../../utils/constant/enums.js";
import { messages } from "../../utils/constant/messages.js";

// create order 
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
  // console.log(`Product ID: ${product.productId}, Price: ${productFinalPrice}, Quantity: ${quantity}`);

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

// Update order
export const updateOrder = async (req, res, next) => {
  const { orderId } = req.params; // Extract order ID from request parameters
  const { address, phone, coupon, payment } = req.body; // Get data from request body

  // Find the order by ID
  const order = await Order.findById(orderId);
  if (!order) {
    return next(new AppError(messages.order.notFound, 404)); // Handle case where order is not found
  }

  // Update address if provided
  if (address) {
    order.address = address;
  }

  // Update phone if provided
  if (phone) {
    order.phone = phone;
  }

  // Update coupon if provided
  if (coupon) {
    const couponExist = await Coupon.findOne({ code: coupon });
    if (!couponExist) {
      return next(new AppError(messages.coupon.notFound, 404));
    }
    if (couponExist.fromDate > Date.now() || couponExist.toDate < Date.now()) {
      return next(new AppError("Invalid coupon", 404));
    }

    order.coupon = {
      couponId: couponExist._id,
      code: couponExist.code,
      discount: couponExist.discountAmount,
    };
  }

  // Update payment if provided
  if (payment) {
    order.payment = payment; // Assuming no validation is needed for payment
  }

  // Save the updated order
  const updatedOrder = await order.save();

  return res.status(200).json({
    message: messages.order.updateSuccessfully,
    success: true,
    data: updatedOrder,
  });
};

// Get all orders
export const getAllOrders = async (req, res, next) => {
  try {
    // Fetch all orders from the database
    const orders = await Order.find().populate('user', 'name email'); // Populate user details if needed

    // Check if there are any orders
    if (!orders || orders.length === 0) {
      return res.status(404).json({
        message: messages.order.notFound,
        success: false,
        data: [],
      });
    }

    // Return the orders in the response
    return res.status(200).json({
      message: messages.order.getAllSuccessfully,
      success: true,
      length: orders.length,
      data: orders,
    });
  } catch (error) {
    return next(new AppError(error.message, 500)); 
  }
};

// Get specific order by ID
export const getSpecificOrder = async (req, res, next) => {
  const { orderId } = req.params; // Extract orderId from request parameters

  try {
    // Fetch the specific order from the database
    const order = await Order.findById(orderId).populate('user', 'name email'); // Populate user details if needed

    // Check if the order exists
    if (!order) {
      return next(new AppError(messages.order.notFound, 404));
    }

    // Return the order in the response
    return res.status(200).json({
      message: messages.order.getSuccessfully,
      success: true,
      data: order,
    });
  } catch (error) {
    return next(new AppError(error.message, 500)); // Handle any unexpected errors
  }
};

// Delete order by ID
export const deleteOrder = async (req, res, next) => {
  const { orderId } = req.params; // Extract orderId from request parameters

  try {
    // Find and delete the order
    const order = await Order.findByIdAndDelete(orderId);

    // Check if the order was found and deleted
    if (!order) {
      return next(new AppError(messages.order.notFound, 404));
    }

    // Return success response
    return res.status(204).json({
      message: messages.order.deleteSuccessfully,
      success: true,
      data: null,
    });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
};

// Soft delete order by updating its status to 'canceled'
export const cancelOrder = async (req, res, next) => {
  const { orderId } = req.params; // Extracting orderId from request params

  try {
    // Finding the order by ID and updating its status to 'canceled'
    // console.log(`Attempting to cancel order with ID: ${orderId}`);
    const order = await Order.findByIdAndUpdate(
      orderId,
      { status: orderStatus.CANCELLED }, // Assuming 'CANCELED' is the status in your enums
      { new: true } // This option ensures the updated document is returned
    );

    // Check if the order exists
    if (!order) {
      // console.log(`Order with ID: ${orderId} not found.`);
      return next(new AppError(messages.order.notFound, 404));
    }

    // console.log(`Order with ID: ${orderId} has been canceled successfully.`);

    // Return success response
    return res.status(200).json({
      message: messages.order.canceledSuccessfully, // Make sure this message exists in your messages object
      success: true,
      data: order, // Returning the updated order
    });
  } catch (error) {
    // console.error(`Error occurred while canceling order: ${error.message}`);
    return next(new AppError(error.message, 500)); // Handling unexpected errors
  }
};