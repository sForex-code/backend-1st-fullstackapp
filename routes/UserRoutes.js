import express from "express"
import { addtoplaylist, deleteMyProfile, deleteUser, forgetpassword, getAllUsers, login, logout, profile, ragisterUser, removePlaylist, resetpassword, updateProfile, updateRole, updatepassword, updateprofilepicture } from "../controllers/UserController.js"
import { authAdmin, isAuth } from "../middlewares/auth.js"
import singleUpload from "../middlewares/multer.js"

const UserRouter=express.Router()


UserRouter.route("/ragister").post( singleUpload,ragisterUser)
UserRouter.route("/login").post(login)
UserRouter.route("/logout").get(logout)
UserRouter.route("/me").get(isAuth, profile).delete(isAuth,deleteMyProfile)
UserRouter.route("/updatepassword").put(isAuth, updatepassword)
UserRouter.route("/updateprofile").put(isAuth, updateProfile)
UserRouter.route("/updateprofilepicture").put(isAuth,singleUpload,updateprofilepicture)
UserRouter.route("/forgetpassword").post(forgetpassword)
UserRouter.route("/resetpassword/:token").put(resetpassword)
UserRouter.route("/addtoplaylist").post(isAuth,addtoplaylist)
UserRouter.route("/removeplaylist").delete(isAuth,removePlaylist)

//Admin routes

UserRouter.route("/admin/users").get(isAuth,authAdmin,getAllUsers)
UserRouter.route("/admin/user/:id").put(isAuth,authAdmin,updateRole).delete(isAuth,authAdmin,deleteUser)



export default UserRouter