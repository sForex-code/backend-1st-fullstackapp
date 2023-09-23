import catchAsynError from "../middlewares/catchAsynError.js";
import { User } from "../models/User.js";
import ErrorHandler from "../utils/ErrorHandler.js";
import {instance} from "../server.js"
import crypto from "crypto"
import { Payment } from "../models/Payment.js";


export const buySubscription=catchAsynError(async(req,res,next)=>{
    const user = await User.findById(req.user._id)
    if(user.role === "admin") return next(new ErrorHandler("admin can't buy subscription",400))
    
     const plan_id = process.env.PLAN_ID || JBOeLWPnNMLaLtL4Gk9rY4F1

    const subscription= await instance.subscriptions.create({
        plan_id,
        customer_notify:1,
        total_count: 12,
      })

      user.subscription.id=subscription.id;
      user.subscription.status=subscription.status

      await user.save()

    res.json({
        sucess:true,
        subscription
    })
})
export const paymentVerfication=catchAsynError(async(req,res,next)=>{
    const{razorpay_signature,razorpay_payment_id,razorpay_subscription_id}=req.body
    const user = await User.findById(req.user._id)

    const subscription_id =user.subscription.id

     
    const genrated_singnature=crypto.createHmac("sha256",process.env.API_SECERT).update(razorpay_payment_id+ "|" + subscription_id,"utf-8").digest("hex")


    const isVerify= genrated_singnature === razorpay_signature

    if(!isVerify) return res.redirect(`${process.env.FRONTEND_URL}/paymentfail`)

    user.subscription.status="active"

    await user.save()

    await Payment.create({
        razorpay_signature,
        razorpay_payment_id,
        razorpay_subscription_id
    })
    
    res.redirect(`${process.env.FRONTEND_URL}/paymentsucess?ref=${razorpay_payment_id}`)

})

export const getKey=catchAsynError((req,res,next)=>{
    res.json({
        sucess:true,
        key:process.env.API_SECERT
    })
})

export const cancelSubscription =catchAsynError(async(req,res,next)=>{
    const user =await User.findById(req.user._id)

    const subscriptionId= user.subscription.id

    console.log(user.subscription.id)
   let refund = false

    await instance.subscriptions.cancel(subscriptionId)

    const payment= await Payment.findOne({
        razorpay_subscription_id:subscriptionId
    })
     const gap = Date.now()- payment.createdAt

     const refundTime = process.env.REFUND * 24 * 60 * 60 * 1000

     if(refundTime>gap){
        await instance.subscriptions.refund(payment.razorpay_payment_id)
        refund=true
     }
     await payment.delete()
     user.subscription.id=undefined
     user.subscription.status=undefined

     await user.save()

  res.json({
    sucess:true,
     refund_status:refund?"subscription cancelled your refund will be recived with in 7 days":"subscription cancelled no refund because you were usind course bundler since more 7 days term & conditiond apply"
})
})