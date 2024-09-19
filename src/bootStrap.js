import { globalErrorHandling } from "./utils/appError.js";
import { authRouter, brandRouter, categoryRouter,productRouter,subcategoryRouter } from "./modules/index.js";

export const bootStrap = (app,express) => {
  // parse req
  app.use(express.json());
  // public foilder
  app.use('/uploads',express.static('uploads'))
  // routing
  app.use('/catehory',categoryRouter)
  app.use('/subcategory',subcategoryRouter)
  app.use('/brand',brandRouter)
  app.use('/product',productRouter)
  app.use('/auth',authRouter)
  // golabl error handler
  app.use(globalErrorHandling)
}