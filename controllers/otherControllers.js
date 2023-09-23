import catchAsynError from "../middlewares/catchAsynError.js";
import { Stats } from "../models/Stats.js";
import ErrorHandler from "../utils/ErrorHandler.js";
import { sendEmail } from "../utils/mailer.js";


export const contactForm =catchAsynError(async(req,res,next)=>{
    const {email,name,message}=req.body

    if(!email || !name || !message) return next(new ErrorHandler("fill the all filds",200))

    let to= "suraj@gmail.com"
    let subject="contact request from curseBundler"
    let text =`my name is ${name} , ${message}`

    await sendEmail(to,subject,text)

    res.status(201).json({
        sucess:true,
        message:"message will be sent to the admin"
    })
})


export const requestForm =catchAsynError(async(req,res,next)=>{
    const {email,name,message}=req.body

    if(!email || !name || !message) return next(new ErrorHandler("fill the all filds",200))

    let subject="course request from curseBundler"
    let text =`my name is ${name} , ${message}`

    await sendEmail(email,subject,text)

    res.status(201).json({
        sucess:true,
        message:"your querry will be sent to the admin"
    })
})

export const getDashBoarStats=catchAsynError(async(req,res,next)=>{
    const stats= await Stats.find({}).sort({createdAt:"desc"}).limit(12)

    const statsData=[]

    for (let i = 0; i < stats.length; i++) {
       statsData.unshift(stats[i]);
    }

    const requriedSize=12-stats.length

    for (let i = 0; i < requriedSize; i++) {
        statsData.unshift({
            subscriptions:0,
            views:0,
            users:0
        });
     }

     const userCount=statsData[11].users
     const viewCount=statsData[11].views
     const subscriptionCount=statsData[11].subscriptions
     
     let userprofit=true,
     viewprofit=true,
     subscriptionprofit=true

     let userpercent=0,
     viewpercent=0,
     subscriptionpercent=0

     if(statsData[10].users===0) userpercent=userCount*100
     if(statsData[10].views===0) viewpercent=viewCount*100
     if(statsData[10].subscriptions===0) subscriptionpercent=subscriptionCount*100

     else{
        const diffrence={
            users:statsData[11].users-statsData[10].users,
            views:statsData[11].views-statsData[10].views,
            subscriptions:statsData[11].subscriptions-statsData[10].subscriptions
        }
        userpercent=(diffrence.users/statsData[10].users)*100
        viewpercent=(diffrence.users/statsData[10].views)*100
        subscriptionpercent=(diffrence.users/statsData[10].subscriptions)*100

        if(userpercent<0) userprofit=false
        if(viewpercent<0) viewprofit=false
        if(subscriptionpercent<0) subscriptionprofit=false
     }
     res.status(201).json({
        stats:statsData,
         userCount,
         viewCount,
         subscriptionCount,
         userprofit,
         viewprofit,
         subscriptionprofit,
         userpercent,
         viewpercent,
         subscriptionpercent,
         length:statsData.length
     })
})