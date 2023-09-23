import mongoose from "mongoose"

const Schema =mongoose.Schema({
    title:{
        type:String,
        required:[true,"please enter course title"],
        minLenght:[4,"title msut be 4 charcters"],
        maxLenght:[80,"title exceed 80 charcters"]
    },
    description:{
        type:String,
        required:[true,"please enter course description"],
        minLenght:[20,"title msut be 4 charcters"],
        maxLenght:[80,"title exceed 80 charcters"]
    },
    lectuers:[
        {
            title:{
                type:String,
                required:true
            },
            description:{
                type:String,
                required:true
            },
            video:{
                public_id:{
                    type:String,
                    required:true 
                },
                url:{
                    type:String,
                    required:true 
               }}
        }
    ],
    poster:{
        public_id:{
            type:String,
            required:true 
        },
        url:{
            type:String,
            required:true 
       }},
       view:{
        type:Number,
        default:0
       },
       numOfVideo:{
        type:Number,
        default:0
       },
       category:{
        type:String,
        required:true
       },
       createdBy:{
        type:String,
        required:true
       },
       createdAt:{
        type:Date,
        default:Date.now
       },

})

export const Course = mongoose.model("Course",Schema)
