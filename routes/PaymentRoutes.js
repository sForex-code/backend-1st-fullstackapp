import express from "express"
import { authuser, isAuth } from "../middlewares/auth.js"
import { buySubscription, cancelSubscription, getKey, paymentVerfication } from "../controllers/paymentControler.js"

const router=express.Router()

router.route("/subscribe").get(isAuth,buySubscription)

router.route("/paymentverification").post(isAuth,paymentVerfication)
router.route("/getkey").get(getKey)
router.route("/subscribe/cancel").delete(isAuth,authuser,cancelSubscription)

export default router
