const { catchAsyncError } = require("../middlewares");
const { StatusCodes } = require("http-status-codes");
const { SuccessResponse, ErrorResponse } = require("../utils/common");
const { ErrorHandler } = require("../utils");
const { sendtoken } = require("../utils/sendtoken");
const User = require("../models/user");
var jwt = require("jsonwebtoken");
const imagekit = require("../utils/imagekit").initImagekit();
const path = require("path");
const {sendmail} = require("../utils/nodemailer")
const crypto = require("crypto")
const Student = require("../models/student");

exports.getstudent = catchAsyncError(async (req, res, next) => {
  const studentData = await Student.findById(req.user._id);

  if (!studentData) {
    return next(new ErrorHandler("Student not found", 404));
  }

  SuccessResponse.data = studentData;
  SuccessResponse.message = "Student data fetched successfully";
  res.json({ SuccessResponse });
});

exports.getAllStudents = catchAsyncError(async (req, res, next) => {
  const students = await Student.find();
  const total = await Student.countDocuments();

  SuccessResponse.data = { students, total };
  SuccessResponse.message = "Student list and total count fetched successfully";
  res.json({ SuccessResponse });
});