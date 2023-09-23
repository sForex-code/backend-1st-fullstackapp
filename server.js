import app from "./app.js";
import { ConnectDB } from "./config/Database.js";
import cloudinary from "cloudinary"
import Razorpay from "razorpay"
import cron from "node-cron"
import { Stats } from "./models/Stats.js";
//CONNECTING DATABSE
ConnectDB()

//payment integration
export const instance = new Razorpay({
    key_id: process.env.API_KEY,
    key_secret:process.env.API_SECERT,
  });

  cron.schedule("* * * 1 * *",async()=>{
    try {
        await Stats.create({})
    } catch (error) {
        console.log(error)
    }
})


cloudinary.v2.config({
    cloud_name:process.env.CLOUD_NAIRY_NAME,
    api_key:process.env.CLOUD_NAIRY_API_KEY,
    api_secret:process.env.CLOUD_NAIRY_API_SECRET
})

app.listen(process.env.PORT,()=>{
    console.log(`server is working on port ${process.env.PORT}`)
})