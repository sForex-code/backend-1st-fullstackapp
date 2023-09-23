 const ErrorMiddleware=(err,req,res,next)=>{

    err.message===err.message || "internal server problem"
    err.statusCode==err.statusCode || 500

    res.status(err.statusCode).json({
        success:false,
        message:err.message
    })
}

export default ErrorMiddleware