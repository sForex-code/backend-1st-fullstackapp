import catchAsynError  from "../middlewares/catchAsynError.js"
import {Course} from "../models/Course.js"
import ErrorHandler from "../utils/ErrorHandler.js"
import getDataUri from "../utils/dataUri.js"
import cloudinary from "cloudinary"
import {Stats} from "../models/Stats.js"



export const getAllCourse=catchAsynError(async(req,res,next)=>{
    const keyword=req.query.keyword || ""
    const category =req.query.category || ""
    const course= await Course.find({
        title:{
            $regex:keyword,
            options:"i"
        },category:{
            $regex:category,
            options:"i"
        }

    }).select("-lectuers")
    res.status(200).json({
        success:true,
        course,
    })
})
export const addNewCourse =catchAsynError(async(req,res,next)=>{
    const {title,description,createdBy,category}=req.body
    if(!title || !description || !createdBy || !category)
    return next(new ErrorHandler("pls fill the all filds",404))
    
    const file = req.file
    console.log(file)
     
   const dataUri =  getDataUri(file)

   const mycloud= await cloudinary.v2.uploader.upload(dataUri.content)


    await Course.create({
        title,
        description,
        createdBy,
        category,
        poster:{
            public_id:mycloud.public_id,
            url:mycloud.secure_url
        }
    })
    res.status(201).json({
        success:true,
        message:"course created succsfully",
    })
})

export const getlectures =catchAsynError(async(req,res,next)=>{
    const course = await Course.findById(req.params.id)
    if(!course) return next(new ErrorHandler("invalid course",404))

    course.view += 1
    await course.save()

    res.json({
        succes:true,
        lectuers:course.lectuers
    })
})
export const addlectures =catchAsynError(async(req,res,next)=>{
    const{id}=req.params
    const {title,description}=req.body

    const file=req.file

    const course = await Course.findById(id)

     if(!course) return next(new ErrorHandler("invalid course",404))

     const dataUri =  getDataUri(file)

     const mycloud= await cloudinary.v2.uploader.upload(dataUri.content,{
        resource_type: "video",
    })
 
    course.lectuers.push({
        title,
        description,
        video:{
            public_id:mycloud.public_id,
            url:mycloud.secure_url
        }
    })
     course.numOfVideo=course.lectuers.length
    await course.save()

    res.json({
        succes:true,
        lectuers:course.lectuers
    })
})
export const deleteCourse =catchAsynError(async(req,res,next)=>{
    const{ id }=req.params;

     const course = await Course.findById(id)
     if(!course) return next(new ErrorHandler("invalid course",404))
    
     await cloudinary.v2.uploader.destroy(course.poster.public_id)


     for (let i = 0; i < course.lectuers.length; i++) {
        const element = course.lectuers[i];
        
        await cloudinary.v2.uploader.destroy(element.video.public_id,{
            resource_type:"video"
        })
     }

     await course.deleteOne()

    res.json({
        succes:true,
        message:"course delete sucessfully"
    })
})
export const removeLecture =catchAsynError(async(req,res,next)=>{
    const{ courseid,lectuerid }=req.query;

      const course = await Course.findById(courseid)
      if(!course) return next(new ErrorHandler("invalid course",404))

    const lectuer = course.lectuers.find(item=>{
        if(item._id.toString() === lectuerid.toString()) return item
     })
     
     await cloudinary.v2.uploader.destroy(lectuer.video.public_id,{
        resource_type:"video"
     })

     course.lectuers = course.lectuers.filter((item)=>{
        if(item._id.toString()!==lectuerid.toString()) return item
     })

     course.numOfVideo=course.lectuers.length

    await course.save()

    res.json({
        succes:true,
        message:"lectures delete sucessfully"
    })
})

Course.watch().on("change",async()=>{
    const stats = await Stats.find({}).sort({createdAt:"desc"}).limit(1)
    const course =await Course.find({})

  let totalviews=0

    for(let i=0; i < course.length; i++){
        totalviews+= course[i].view
    }

    stats[0].views=totalviews
    stats[0].createdAt=new Date(Date.now())

    await stats[0].save()

})
