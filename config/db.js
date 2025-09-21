const mongoose  = require('mongoose');
const {catchAsyncError} = require("../middlewares")
exports.connectdb = catchAsyncError(async (req,res,next)=>{
        await mongoose.connect(process.env.MONGODB_URI)
        console.log("Connected to MongoDB");
})