// import modules
import path from "path";
import express from "express";
import dotenv from "dotenv";
import { scheduleJob } from "node-schedule";
import { connectDB } from "./db/connection.js";
import { bootStrap } from "./src/bootStrap.js";
import { User } from "./db/index.js";
import { status } from "./src/utils/constant/enums.js";
// creat server
const app = express();
scheduleJob("1 1 1 * * *", async function () {
  const users = await User.find({
    status: status.PENDING,
    createdAt:{ $lta: Date.now() - 1 * 30 * 24 * 60 * 60 * 1000},
  }).lean();
  const userIds = users.map((user) => {return user.id})
  await User.deleteMany({_id: { $in:userIds }})
  // delete image 
});
scheduleJob("1 1 1 * * *",async () => {
  const users = await User.find({ status:  status.DELETED , updatedAt:Date.now()-3*30*24*60*60*1000 })
})
const port = 3000;
dotenv.config({ path: path.resolve("./config/.env") });
// console.log(process.env.DB_URL);

// connect to db
connectDB();
// pares req
bootStrap(app, express);
// listen server
app.listen(port, () => {
  console.log("server listening on port", port);
});
