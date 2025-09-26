
// Student login route

const express = require('express');
const router = express.Router();
const { ErrorHandler } = require('../../utils/ErrorHandler');
const { StatusCodes } = require('http-status-codes');
const { sendtoken } = require('../../utils/sendtoken');
const { authMiddleware } = require("../../middlewares");
const {studentController} = require('../../controllers')


const WeeklySchedule = require('../../models/weeklySchedule');
const Attendance = require('../../models/attendance');
const Student = require('../../models/student');
router.get('/all',  studentController.getAllStudents)
router.post('/login', async (req, res, next) => {
  try {
    const { rollNo, name } = req.body;
    if (!rollNo || !name) {
      return res.status(StatusCodes.BAD_REQUEST).json({ error: 'Roll number and username required' });
    }
    const student = await Student.findOne({ rollNo, name });
    if (!student) {
      return res.status(StatusCodes.UNAUTHORIZED).json({ error: 'Invalid credentials' });
    }
    // Send JWT token
    sendtoken(student, StatusCodes.OK, res);
  } catch (err) {
    next(err);
  }
});
// GET today's schedule and attendance for a student
router.get('/schedule-today', async (req, res) => {
  try {
  // Use Indian Standard Time (IST) for all calculations
  const dayjs = require('dayjs');
  const timezone = require('dayjs/plugin/timezone');
  dayjs.extend(timezone);
  const istNow = dayjs().tz('Asia/Kolkata');
  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const todayName = dayNames[istNow.day()];

    const weeklySchedule = await WeeklySchedule.findOne({}).populate('week.classes.teacher', 'userName');
    if (!weeklySchedule) {
      return res.json({ today: todayName, classes: [], message: "No schedule found." });
    }

    const todayObj = weeklySchedule.week.find(dayObj => dayObj.day === todayName);
    if (!todayObj) {
      return res.json({ today: todayName, classes: [], message: `No classes scheduled for ${todayName}.` });
    }

    // Import ClassSession model
    const ClassSession = require('../../models/classSession');
    // Import Subject model (create if not exists)
    const Subject = require('../../models/subject');
    // For each class, check QR/cancellation status from ClassSession
    const classes = await Promise.all(todayObj.classes.map(async (cls, idx) => {
      let subjectName = cls.subject;
      if (typeof subjectName === 'string' && subjectName.length === 24) {
        const Subject = require('../../models/subject');
        const subjDoc = await Subject.findById(subjectName);
        if (subjDoc && subjDoc.name) subjectName = subjDoc.name;
      }
      let qrGenerated = false, cancelled = false;
      let status = "Not Held";
      let sessionId = null;
      // Find ClassSession by period, teacher, section, branch, year (skip subject for now)
      const istMidnight = istNow.startOf('day').toDate();
      const istEnd = istNow.endOf('day').toDate();
      const session = await ClassSession.findOne({
        date: {
          $gte: istMidnight,
          $lte: istEnd
        },
        period: idx+1,
        teacher: cls.teacher?._id,
        section: weeklySchedule.section,
        branch: weeklySchedule.branch,
        year: weeklySchedule.year
      });
      qrGenerated = session ? session.qrGenerated : false;
      cancelled = session ? session.cancelled : false;
      if (session) sessionId = session._id;
      if (cancelled) status = "Cancelled";
      else if (qrGenerated) status = "Held";
      return {
        subjectName,
        time: `${cls.startTime} - ${cls.endTime}`,
        teacherName: cls.teacher?.userName || 'Teacher',
        qrGenerated,
        cancelled,
        status,
        sessionId
      };
    }));

    res.json({ today: todayName, classes });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch schedule" });
  }
});

router.get('/getstudent',authMiddleware.isStudentAuthenticated,studentController.getstudent)
module.exports = router;
