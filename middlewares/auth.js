import { User } from "../models/User.js";
import ErrorHandler from "../utils/ErrorHandler.js";
import catchAsynError from "./catchAsynError.js";
import jwt  from "jsonwebtoken";


export const isAuth = catchAsynError(async(req,res,next)=>{   
    const {token}=req.cookies
    if(!token)
    return next(new ErrorHandler("login first",404))

    const decode = jwt.verify(token,process.env.SECRET) 
    req.user= await User.findById(decode._id)
    next()
})


export const authAdmin = (req,res,next)=>{
    if(req.user.role !=="admin") return next(new ErrorHandler("user cant acess this resource",409));
    next()
}

export const authuser = (req,res,next)=>{
    if(req.user.role !=="admin" && req.user.subscription.status!=="active") return next(new ErrorHandler("you can't acess this resource pls subscribe the plan",409));
    next()
}