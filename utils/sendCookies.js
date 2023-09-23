
export const sendCookies=(res,user,message,statusCode=500)=>{
    const token=user.getJWTToken()

    const option={
        expires:new Date(Date.now()+15 * 24 * 60 * 60 *1000),
        httpOnly:true,
        secure:true,
        sameSite:"none",
    }
    res.status(statusCode).cookie("token",token,option).json({
        success:true,
        message,
        user
    })
}