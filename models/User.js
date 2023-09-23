import mongoose from "mongoose"
import validator from "validator"
import jwt from "jsonwebtoken" 
import { Course } from "./Course.js"
import bcrypt from "bcrypt"
import crypto from "crypto"

const Schema =mongoose.Schema({
    name:{
        type:String,
        required:[true,"please enter your name"]
    },
    email:{
        type:String,
        required:[true,"please enter your email"],
        unique:true,
        validate:validator.isEmail
    },
    password:{
        type:String,
        required:[true,"please enter your password"],
        minLength:[6,"password must be 6 charcter"],
        select:false
    },
    role:{
        type:String,
        default:"user",
        enum:["admin","user"]
    },
    subscription:{
        id:String,
        status:String
    },
    avtar:{
        public_id:{
            type:String,
            required:true 
        },
        url:{
            type:String,
            required:true 
        }},
        playlist:[
            {
                course:{
                    type:mongoose.Schema.Types.ObjectId,
                    ref:Course
                },
                poster:String
            }],

        createdAt:{
            type:Date,
            default:Date.now
        },

        resetPasswordToken:String,
        resetPasswordExpire:String
})

Schema.pre("save", async function(next){
    if(!this.isModified("password")) return next()
   this.password = await bcrypt.hash(this.password,10)
   next()
})

Schema.methods.comparePassword =async function(password){
   return await bcrypt.compare(password,this.password)
}

Schema.methods.getJWTToken =function(){
    return jwt.sign({_id:this._id},process.env.SECRET,{
        expiresIn:"15d"
    })
}
Schema.methods.getResetToken =function(){
    const resetToken= crypto.randomBytes(20).toString("hex");

    this.resetPasswordToken=crypto.createHash("sha256").update(resetToken).digest("hex")
    
    this.resetPasswordExpire=Date.now()+15 *60 *1000

    return resetToken;
}

export const User= mongoose.model("User",Schema)

