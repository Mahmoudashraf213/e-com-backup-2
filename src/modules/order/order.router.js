import { Router } from "express";
import { isAuthenticated } from "../../middleware/authentication.js";
import { isAuthorized } from "../../middleware/autheraization.js";
import { roles } from "../../utils/constant/enums.js";
import { asyncHandler } from "../../utils/appError.js";
import { cancelOrder, createOrder, deleteOrder, getAllOrders, getSpecificOrder, updateOrder } from "./order.controller.js";
import { isValid } from "../../middleware/vaildation.js";
import { createOrderVal, updateOrderVal } from "./order.vaildation.js";

const orderRouter = Router()

// creat order
orderRouter.post('/',
  isAuthenticated(),
  isAuthorized([roles.ADMIN, roles.USER]),
  // isValid(createOrderVal),
  asyncHandler(createOrder)
)

// Update order
orderRouter.put('/:orderId',
  isAuthenticated(),
  isAuthorized([roles.ADMIN, roles.USER]),
  // isValid(updateOrderVal),
  asyncHandler(updateOrder)
);

// Get all orders
orderRouter.get('/', 
  isAuthenticated(), 
  isAuthorized([roles.ADMIN]), // Assuming only admin can get all orders
  asyncHandler(getAllOrders)
);

// Get specific order by ID
orderRouter.get('/:orderId', 
  isAuthenticated(), 
  isAuthorized([roles.ADMIN, roles.USER]), // Adjust based on your authorization needs
  asyncHandler(getSpecificOrder)
);

// Delete order by ID
orderRouter.delete('/:orderId', 
  isAuthenticated(), 
  isAuthorized([roles.ADMIN]), // Adjust based on your authorization needs
  asyncHandler(deleteOrder)
);

orderRouter.patch(
  '/cancel/:orderId', // Route to cancel an order by ID
  isAuthenticated(), // Only authenticated users can cancel orders
  isAuthorized([roles.ADMIN, roles.USER]), // Only specific roles (Admin and User) can cancel orders
  asyncHandler(cancelOrder) // Using async handler to manage potential errors
);


export default orderRouter