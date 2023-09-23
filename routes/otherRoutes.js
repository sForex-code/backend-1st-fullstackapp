import express from "express"
import { authAdmin, isAuth } from "../middlewares/auth.js"
import { contactForm, getDashBoarStats, requestForm } from "../controllers/otherControllers.js"

const router=express.Router()

router.route("/contact").post(isAuth,contactForm)
router.route("/request").post(isAuth,requestForm)
router.route("/admin/stats").get(isAuth,authAdmin,getDashBoarStats)

export default router
