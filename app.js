import express from "express";
import { config } from "dotenv";
import ErrorMiddleware  from "./middlewares/Error.js";
import cookieParser from "cookie-parser";
import cors from "cors"
config({
    path:"./config/Config.env"
})
 const app =express()
 //using middleares
app.use(cors({
    origin:process.env.FRONTEND_URL,
    credentials:true,
    methods:["GET","POST","PUT","DELETE"]
}))
 app.use(express.json())
 app.use(express.urlencoded({extended:true}))
 app.use(cookieParser())

 //importing and using routes

 import UserRouter from "./routes/UserRoutes.js";
 import CourseRouter from "./routes/CourseRoutes.js";
 import PaymentRouter from "./routes/PaymentRoutes.js"
 import OtherRoutes from "./routes/otherRoutes.js"

 app.get("/",(req,res)=>{res.send("<h1>server is working</h1>")})
 app.use("/api/v1",CourseRouter)
 app.use("/api/v1",UserRouter)
 app.use("/api/v1",PaymentRouter)
 app.use("/api/v1",OtherRoutes)

 export default app

 app.use(ErrorMiddleware)