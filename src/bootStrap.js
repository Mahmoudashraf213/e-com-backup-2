import { globalErrorHandling } from "./utils/appError.js";
import { authRouter, brandRouter, cartRouter, categoryRouter,couponRouter,orderRouter,productRouter,reviewRouter,subcategoryRouter, userRouter, wishlistRouter } from "./modules/index.js";

export const bootStrap = (app,express) => {
  // parse req
  app.use(express.json());
  // public foilder
  app.use('/uploads',express.static('uploads'))
  // routing
  app.use('/category',categoryRouter)
  app.use('/subcategory',subcategoryRouter)
  app.use('/brand',brandRouter)
  app.use('/product',productRouter)
  app.use('/auth',authRouter)
  app.use('/review',reviewRouter)
  app.use('/coupon',couponRouter)
  app.use('/wishlist',wishlistRouter)
  app.use('/cart',cartRouter)
  app.use('/user',userRouter)
  app.use('/order',orderRouter)
  // golabl error handler
  app.use(globalErrorHandling)
}