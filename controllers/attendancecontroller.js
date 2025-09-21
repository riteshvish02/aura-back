
const { catchAsyncError } = require("../middlewares");
const { StatusCodes } = require("http-status-codes");
const { SuccessResponse, ErrorResponse } = require("../utils/common");
const { ErrorHandler } = require("../utils");
const Attendance = require("../models/attendance");
const Student = require("../models/student");
const ClassSession = require("../models/classSession");
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');
dayjs.extend(utc);
dayjs.extend(timezone);
// Get today's attendance for a student
exports.getStudentTodayAttendance = catchAsyncError(async (req, res, next) => {
  const { studentId, date } = req.query;
  if (!studentId) {
    return next(new ErrorHandler("studentId is required", StatusCodes.BAD_REQUEST));
  }
  // Use provided date for IST day range, else use current IST day
  let matchDate;
  if (date) {
    matchDate = dayjs(date).tz('Asia/Kolkata').startOf('day').toDate();
  } else {
    const istNow = dayjs().tz('Asia/Kolkata');
    matchDate = istNow.startOf('day').toDate();
  }
  const AttendanceModel = require('../models/attendance');
  const attendance = await AttendanceModel.find({
    student: studentId,
    date: matchDate
  });
  const allAttendance = await AttendanceModel.find({ student: studentId });
  console.log('DEBUG ATTENDANCE FETCH: matchDate:', matchDate, 'studentId:', studentId);
  console.log('DEBUG ATTENDANCE FETCH: Matching records:', attendance);
  console.log('DEBUG ATTENDANCE FETCH: All attendance records for student:', allAttendance);
  SuccessResponse.data = attendance;
  SuccessResponse.attendance = attendance;
  SuccessResponse.message = "Today's attendance fetched";
  return res.status(StatusCodes.OK).json({ SuccessResponse, debug: { matchDate, attendance, allAttendance } });
});
// Mark attendance for a student by scanning QR
exports.markAttendanceByQR = catchAsyncError(async (req, res, next) => {
  const { sessionId, studentId } = req.body;
  let session = null;
  // If sessionId is provided, use new method
  if (sessionId && studentId) {
    session = await ClassSession.findById(sessionId);
    if (!session || !session.qrGenerated) {
      return next(new ErrorHandler("Invalid or inactive QR/session", StatusCodes.BAD_REQUEST));
    }
  } else {
    // Old method: match session by startTime, endTime, teacher, date, and period
    const { startTime, endTime, teacher, date, period } = req.body;
    if (!startTime || !endTime || !teacher || !date || !studentId || !period) {
      return next(new ErrorHandler("Required fields missing for old QR method (need period)", StatusCodes.BAD_REQUEST));
    }
    // Convert teacher username to ObjectId
    let teacherId = teacher;
    if (typeof teacher === 'string' && teacher.length !== 24) {
      const User = require('../models/user');
      const teacherDoc = await User.findOne({ userName: teacher });
      if (!teacherDoc) {
        return next(new ErrorHandler("Teacher not found", StatusCodes.NOT_FOUND));
      }
      teacherId = teacherDoc._id;
    }
    const istDate = dayjs(date).tz('Asia/Kolkata');
    const istMidnight = istDate.startOf('day').toDate();
    const istEnd = istDate.endOf('day').toDate();
    session = await ClassSession.findOne({
      date: { $gte: istMidnight, $lte: istEnd },
      teacher: teacherId,
      period: period,
      // Optionally match subject: req.body.subject
    });
    console.log('DEBUG: Found ClassSession _id:', session ? session._id : null);
    if (!session) {
      return next(new ErrorHandler("Class session not found for provided details", StatusCodes.NOT_FOUND));
    }
  }
  const student = await Student.findById(studentId);
  if (!student) {
    return next(new ErrorHandler("Student not found", StatusCodes.NOT_FOUND));
  }
  // Check if already marked for this session/class
  const alreadyMarked = await Attendance.findOne({ student: studentId, schedule: session._id });
  if (alreadyMarked) {
    SuccessResponse.data = alreadyMarked;
    SuccessResponse.message = "Attendance already marked for this session";
    return res.status(StatusCodes.OK).json({ SuccessResponse });
  }
  // Always save attendance date as IST midnight (start of day) using dayjs Asia/Kolkata
  const dateISTMidnight = dayjs(session.date).tz('Asia/Kolkata').startOf('day').toDate();
  console.log('Saving attendance with date:', dateISTMidnight, 'session.date:', session.date);
  // Create attendance record
  const attendance = new Attendance({
    student: studentId,
    schedule: session._id, // Set schedule field to ClassSession _id
    date: dateISTMidnight,
    status: "present",
    markedAt: new Date(),
    // Optionally add session/class info
  });
  await attendance.save();
  console.log('Attendance saved:', attendance);
  console.log('DEBUG: Attendance schedule field:', attendance.schedule);
  SuccessResponse.data = attendance;
  SuccessResponse.message = "Attendance marked successfully";
  return res.status(StatusCodes.CREATED).json({ SuccessResponse });
});
