const { catchAsyncError } = require("./catchAsyncError");
const User = require("../models/user");
const Student = require("../models/student");
const { ErrorHandler } = require("../utils");
var jwt = require("jsonwebtoken");

exports.isAuthenticated = catchAsyncError(async (req, res, next) => {
  const authHeader = req.headers.authorization;
  console.log("Auth Header:", authHeader);
  if (!authHeader || !authHeader.startsWith("Bearer")) {
    return next(new ErrorHandler("Please log in to access this resource", 401));
  }

  const token = authHeader.split(" ")[1];
  if (!token || token === 'undefined') {
    return next(new ErrorHandler("Please log in to access this resource", 401));
  }

  try {
    const decodedData = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded JWT Data:", decodedData);
    req.user = await User.findById(decodedData.id);
    if (!req.user) {
      return next(new ErrorHandler("User no longer exists", 401));
    }
      
    next();
  } catch (error) {
    // Handle specific JWT errors
    if (error.name === "TokenExpiredError") {
      return next(new ErrorHandler("Session expired, please login again", 401));
    } else if (error.name === "JsonWebTokenError") {
      return next(new ErrorHandler("Invalid token, please login again", 401));
    } else {
      return next(new ErrorHandler("Authentication error", 401));
    }
  }
});

exports.isStudentAuthenticated = catchAsyncError(async (req, res, next) => {
  const authHeader = req.headers.authorization;
  console.log("Auth Header:", authHeader);
  if (!authHeader || !authHeader.startsWith("Bearer")) {
    return next(new ErrorHandler("Please log in to access this resource", 401));
  }

  const token = authHeader.split(" ")[1];
  if (!token || token === 'undefined') {
    return next(new ErrorHandler("Please log in to access this resource", 401));
  }

  try {
    const decodedData = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded JWT Data:", decodedData);
    req.user = await Student.findById(decodedData.id);
    if (!req.user) {
      return next(new ErrorHandler("User no longer exists", 401));
    }
      
    next();
  } catch (error) {
    // Handle specific JWT errors
    if (error.name === "TokenExpiredError") {
      return next(new ErrorHandler("Session expired, please login again", 401));
    } else if (error.name === "JsonWebTokenError") {
      return next(new ErrorHandler("Invalid token, please login again", 401));
    } else {
      return next(new ErrorHandler("Authentication error", 401));
    }
  }
});

exports.authorizeRoles = (...roles)=>{
  return catchAsyncError(async (req, res, next) => {
   const user = await User.findById(req.user._id);
   
   if(!roles.includes(user.role)){
      return next(new ErrorHandler("You are not authorized to access this resource", 403));
   }    
   next();
  });
}
  