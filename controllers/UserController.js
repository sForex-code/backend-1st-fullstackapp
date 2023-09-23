import catchAsyncError from "../middlewares/catchAsynError.js"
import { Course } from "../models/Course.js"
import {User} from "../models/User.js"
import ErrorHandler from "../utils/ErrorHandler.js"
import getDataUri from "../utils/dataUri.js"
import { sendEmail } from "../utils/mailer.js"
import { sendCookies } from "../utils/sendCookies.js"
import crypto from "crypto"
import cloudinary from "cloudinary"
import { Stats } from "../models/Stats.js"

export const ragisterUser =catchAsyncError(async(req,res,next)=>{
    const {name,email,password}=req.body
    const file = req.file
   
    if(!name || !email || !password || !file) return next(new ErrorHandler("please fill all fields",404))

    let user = await User.findOne({email})
    if(user) return next(new ErrorHandler("user already exist",409))

// uplod file in cloundary

const fileUri= getDataUri(file)

 const myCloud = await cloudinary.v2.uploader.upload(fileUri.content)


     user = await User.create({
        name,
        email,
        password,
        avtar:{
            public_id:myCloud.public_id,
            url:myCloud.secure_url
        }
    })
    sendCookies(res,user,"ragister succesFully",201)
})
export const login =catchAsyncError(async(req,res,next)=>{
    const {email,password}=req.body
   
    if( !email || !password) return next(new ErrorHandler("please fill all fields",404))

    const user = await User.findOne({email}).select("+password")
    if(!user) return next(new ErrorHandler("user does't exist",409))

    const isMatch = await user.comparePassword(password)
    if(!isMatch) return next(new ErrorHandler("incorrect user & password",409))

    sendCookies(res,user,"login successfully",201)
})

export const logout =catchAsyncError((req,res)=>{
    res.status(200).cookie("token",null,{
        expires:new Date(Date.now()),
        httpOnly:true,
        secure:true,
        sameSite:"none",
    }).json({
        success:true,
        message:"logged out"
    })

})

export const profile =catchAsyncError(async(req,res)=>{
    const user= await User.findById(req.user._id)

    res.status(200).json({
        success:true,
        user   
     })
})

export const updatepassword =catchAsyncError(async(req,res,next)=>{
    const {oldPassword,newPassword}=req.body
   
    if( !oldPassword || !newPassword) return next(new ErrorHandler("please fill all fields",404))

    const user = await User.findById(req.user._id).select("+password")

    const isMatch = await user.comparePassword(oldPassword)
    if(!isMatch) return next(new ErrorHandler("incorrect old password",409))

    user.password=newPassword

    await user.save()
    res.status(400).json({
        success:true,
        message:"password changed successfully"
    })
})
export const updateProfile =catchAsyncError(async(req,res,next)=>{
    const {name,email}=req.body
   
    if( !name || !email) return next(new ErrorHandler("please fill all fields",404))

    const user = await User.findById(req.user._id)
    if(name) user.name=name
    if(email) user.email=email

    await user.save()
    res.status(400).json({
        success:true,
        message:"profile update successfully"
    })
})

export const updateprofilepicture =catchAsyncError(async(req,res)=>{
    const file =req.file
    const user =await User.findOne(req.user._id)

    await cloudinary.v2.uploader.destroy(user.avtar.public_id)

    const fileUri=getDataUri(file)

     await cloudinary.v2.uploader.upload(fileUri.content)

    res.status(200).json({
        success:true,
        message:"profile picture update successfully"
     })
})

export const forgetpassword = catchAsyncError( async(req,res,next)=>{
    
    const {email}= req.body
    
    const user= await User.findOne({email})
     if(!user) return next(new ErrorHandler("user not found",400))
     
     const resetToken = await user.getResetToken()

     await user.save()

     const url =`${process.env.FRONTEND_URL}/resetpassword/${resetToken}`

     const message=`your forget passworld link will send on ${url} ` 

     await sendEmail(user.email,"course bundler reset password",message)

    res.status(200).json({
        success:true,
        message:"password will send in your email"
     })
})


export const resetpassword =catchAsyncError(async(req,res,next)=>{

    const {token}=req.params

    const resetPasswordToken=crypto.createHash("sha256").update(token).digest("hex")

    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire:{
            $gt:Date.now()
        }
    })

    if(!user) return next(new ErrorHandler("invalid token or token was expires",400))

    const{password}=req.body

    user.password=password
    user.resetPasswordToken=undefined
    user.resetPasswordExpire=undefined
    
    await user.save()

    res.status(200).json({
        success:true,
        message:"password changed"
     })
})


export const addtoplaylist =catchAsyncError(async(req,res,next)=>{
    const user= await User.findById(req.user._id)

    const course= await Course.findById(req.body.id)

    if(!course) return next(new ErrorHandler("invalid course",400))

    const itemexist = user.playlist.find((item)=>{
        if(item.course.toString() === course._id.toString()) return true
    })

    if(itemexist) return next(new ErrorHandler("already exist",409))

    user.playlist.push({
        course:course._id,
        poster:course.poster.url
    })

    await user.save()
    res.status(200).json({
        success:true,
        message:"add to playlist"
     })
})


export const removePlaylist =catchAsyncError(async(req,res,next)=>{
    const user= await User.findById(req.user._id)
    const course= await Course.findById(req.query.id)
    if(!course) return next(new ErrorHandler("invalid course",400))

    const newPlaylist = user.playlist.filter(item=>{
        if(item.course.toString()!==course._id.toString()) return item
    })

    user.playlist=newPlaylist
    await user.save()
    res.status(200).json({
        success:true,
        message:"remove from playlist"
     })
})


export const getAllUsers =catchAsyncError(async(req,res,next)=>{
    const users= await User.find()

    res.status(200).json({
        success:true,
        users
     })
})


export const updateRole =catchAsyncError(async(req,res,next)=>{
    const user = await User.findById(req.params.id)

    if(user.role === "user") user.role="admin"
    else user.role="user"

    await user.save()

    res.status(200).json({
        success:true,
        message:"role updated "
     })
})

export const deleteUser =catchAsyncError(async(req,res,next)=>{
    const user = await User.findById(req.params.id)

    if(!user) return next(new ErrorHandler("user not exist",404)) 

    await cloudinary.v2.uploader.destroy(user.avtar.public_id)

    await user.deleteOne()

    res.status(200).json({
        success:true,
        message:"user deleted"
     })
})

export const deleteMyProfile =catchAsyncError(async(req,res,next)=>{
    const user = await User.findById(req.user._id)

    if(!user) return next(new ErrorHandler("user not exist",404)) 

    await cloudinary.v2.uploader.destroy(user.avtar.public_id)

    await user.deleteOne()

    res.status(200).cookie("token",null,{
        expires:new Date(Date.now())
    }).json({
        success:true,
        message:"user deleted"
     })
})

User.watch().on("change",async()=>{
    const stats = await Stats.find({}).sort({createdAt:"desc"}).limit(1)
    const user = await User.find({"subscriptions.status":"active"})

    stats[0].users=await User.countDocuments()
    stats[0].subscriptions=user.length
    stats[0].createdAt =new Date(Date.now())

    await stats[0].save()

})
