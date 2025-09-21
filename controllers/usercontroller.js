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


exports.register = catchAsyncError(async (req, res, next) => {
  const { firstName, lastName, email, password, phone } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new ErrorHandler("User with this email already exits", 500));
  }

  const newUser = new User({ firstName, lastName, email, password, phone });
  if (req.files) {
    const file = req.files.avatar;
    const modifiedfilename = `user${email}-${Date.now()}${path.extname(
      file.name
    )}`;
    const { fileId, url } = await imagekit.upload({
      file: file.data,
      fileName: modifiedfilename,
    });
    if (newUser.avatar.fileId !== "") {
      await imagekit.deleteFile(newUser.avatar.fileId);
    }
    Student.avtar = { fileId, url };
  }
  await newUser.save();
  sendtoken(newUser, StatusCodes.OK, res);
});
exports.login = catchAsyncError(async (req, res, next) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    return next(
      new ErrorHandler("Invalid credentials", StatusCodes.BAD_REQUEST)
    );
  }
  const isMatch = await user.comparepassword(password);
  if (!isMatch) {
    return next(
      new ErrorHandler("Invalid credentials", StatusCodes.BAD_REQUEST)
    );
  }
  sendtoken(user, StatusCodes.OK, res);
});
exports.getuser = catchAsyncError(async (req, res, next) => {
  const userData = await User.findById(req.user._id);

  if (!userData) {
    return next(new ErrorHandler("User not found", 404));
  }

  SuccessResponse.data = userData;
  SuccessResponse.message = "User data fetched successfully";
  res.json({ SuccessResponse });
});

exports.getUserProfile = catchAsyncError(async (req, res, next) => {
  const userData = await User.findById(req.params.userId).exec();
  if (!userData) {
    return next(new ErrorHandler("User not found", 404));
  }
  SuccessResponse.data = userData;
  SuccessResponse.message = "User data fetched successfully";
  res.json({ SuccessResponse });
});

exports.getAllUsers = catchAsyncError(async (req, res, next) => {
  const userData = await User.find();
  SuccessResponse.data = userData;
  SuccessResponse.message = "User data fetched successfully";
  res.json({ SuccessResponse });
});

exports.deleteUser = catchAsyncError(async (req, res, next) => {
  const userData = await User.findByIdAndDelete(req.params.userId).exec();
  SuccessResponse.data = userData;
  SuccessResponse.message = "User deleted successfully";
  res.json({ SuccessResponse });
});

exports.refreshToken = catchAsyncError(async (req, res, next) => {
  const { refreshToken } = req.body;
  const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
  const user = await User.findById(decoded.id);
  if (!user || user.refreshToken !== refreshToken) {
    return next(
      new ErrorHandler("Invalid refresh token", StatusCodes.BAD_REQUEST)
    );
  }
  const accessToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
  });
  SuccessResponse.message.token = accessToken;
  res.status(StatusCodes.OK).json({ SuccessResponse });
});

exports.info = catchAsyncError(async (req, res, next) => {
  return res.status(StatusCodes.OK).json({
    SuccessResponse,
  });
});

exports.updateUser = catchAsyncError(async (req, res, next) => {
  const userId = req.user._id;
  const { firstName, lastName, email, phone } = req.body;

  const user = await User.findById(userId);
  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }

  if (req.body.password) {
    return next(new ErrorHandler("Password cannot be updated here", 400));
  }

  if (email) {
    const existEmail = User.find({ email: email });
    if (existEmail.length > 0) {
      return next(new ErrorHandler("user with this email already exists", 500));
    }
    user.email = email;
  }
  if (firstName) user.firstName = firstName;
  if (lastName) user.lastName = lastName;
  if (phone) user.phone = phone;

  if (req.files && req.files.avatar) {
    const file = req.files.avatar;
    const modifiedFilename = `user-${email}-${Date.now()}${path.extname(
      file.name
    )}`;

    if (user.avatar?.fileId) {
      await imagekit.deleteFile(user.avatar.fileId);
    }

    const { fileId, url } = await imagekit.upload({
      file: file.data,
      fileName: modifiedFilename,
    });

    user.avatar = { fileId, url };
  }
  await user.save();
  SuccessResponse.data = user;
  SuccessResponse.message = "User Updated successfully";
  res.json({ SuccessResponse });
});

exports.changePassword = catchAsyncError(async (req, res, next) => {
  const userData = await User.findById(req.user._id).select("+password");
  if (!userData) {
    return next(new ErrorHandler("User not found", 500));
  }
  const isMatch = await userData.comparepassword(req.body.oldpassword);
  if (!isMatch) {
    return next(
      new ErrorHandler("old password is incorrect", StatusCodes.BAD_REQUEST)
    );
  }
  userData.password = req.body.newpassword;
  await userData.save();
  sendtoken(userData, StatusCodes.OK, res)
});

exports.forgotPassword = catchAsyncError(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }

  // Get ResetPassword Token
  const resetToken = user.getResetPasswordToken();

  await user.save();

  const resetPasswordUrl = `${req.protocol}://${req.get(
    "host"
  )}/password/reset/${resetToken}`;

  try {
    await sendmail({
      email: user.email,
      resetPasswordUrl,
    });
    SuccessResponse.message = "mail sent successfully";
    res.status(StatusCodes.OK).json({
     SuccessResponse,
    });
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();
    return next(new ErrorHandler(error.message, 500));
  }
});

// Reset Password
exports.resetPassword = catchAsyncError(async (req, res, next) => {
  const userId = req.params.userId;
  const { currentPassword, newPassword, confirmPassword } = req.body;

  // Step 1: find user
  const user = await User.findById(userId).select("+password");
  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }

  // Step 2: check current password
  const isMatch = await user.comparepassword(currentPassword);
  if (!isMatch) {
    return next(new ErrorHandler("Current password is incorrect", 400));
  }

  // Step 3: check confirm password
  if (newPassword !== confirmPassword) {
    return next(new ErrorHandler("New password and confirmation do not match", 400));
  }

  // Step 4: set new password
  user.password = newPassword;
  await user.save();
  SuccessResponse.message = "Password updated successfully";
  res.json({
    SuccessResponse
  });
});