import express from "express"
import { addNewCourse, addlectures, deleteCourse, getAllCourse, getlectures, removeLecture } from "../controllers/CourseControle.js"
import singleUpload from "../middlewares/multer.js"
import { authAdmin, authuser, isAuth } from "../middlewares/auth.js"


const CourseRouter=express.Router()


CourseRouter.route("/allCourse").get(isAuth,getAllCourse)
CourseRouter.route("/createcourse").post(isAuth,authAdmin,singleUpload,addNewCourse)
CourseRouter.route("/getlectuers/:id").get(isAuth,authuser,getlectures).post(isAuth,authAdmin,singleUpload,addlectures).delete(isAuth,authAdmin,deleteCourse)
CourseRouter.route("/lectures").delete(isAuth,authAdmin,removeLecture)

export default CourseRouter
