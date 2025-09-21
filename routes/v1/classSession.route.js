
const express = require('express');
const router = express.Router();
const ClassSession = require('../../models/classSession');
const WeeklySchedule = require('../../models/weeklySchedule');
const Student = require('../../models/student');
const User = require('../../models/user');
const { StatusCodes } = require('http-status-codes');
const { ErrorHandler } = require('../../utils/ErrorHandler');
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');
dayjs.extend(utc);
dayjs.extend(timezone);
// GET /api/v1/session/today-schedule?teacherId=...
router.get('/today-schedule', async (req, res, next) => {
  try {
    const { teacherId } = req.query;
    if (!teacherId) {
      return res.status(StatusCodes.BAD_REQUEST).json({ error: 'teacherId required' });
    }
    const teacher = await User.findById(teacherId);
    if (!teacher) {
      return res.status(StatusCodes.NOT_FOUND).json({ error: 'Teacher not found' });
    }
  // Get IST date using dayjs
  const istNow = dayjs().tz('Asia/Kolkata');
  const istMidnight = istNow.startOf('day').toDate();
  const istEnd = istNow.endOf('day').toDate();

    // Find all ClassSessions for teacher today
    const sessions = await ClassSession.find({
      date: { $gte: istMidnight, $lte: istEnd },
      teacher: teacher._id
    }).populate('subject section branch year');

    // Format for frontend
    const classes = sessions.map(session => ({
      subject: session.subject?.name || 'Subject',
      period: session.period,
      time: session.startTime && session.endTime ? `${session.startTime} - ${session.endTime}` : '',
      section: session.section?.name || '',
      branch: session.branch?.name || '',
      year: session.year?.name || '',
      status: session.cancelled ? 'Cancelled' : (session.qrGenerated ? 'Held' : 'Not Held'),
      sessionId: session._id
    }));
  res.json({ today: istNow.format('YYYY-MM-DD'), classes });
  } catch (err) {
    next(err);
  }
});
// GET /api/v1/session/status?studentId=...
router.get('/status', async (req, res, next) => {
  try {
    const { studentId } = req.query;
    if (!studentId) {
      return res.status(StatusCodes.BAD_REQUEST).json({ error: 'studentId required' });
    }
    const student = await Student.findById(studentId).populate('branch year section');
    if (!student) {
      return res.status(StatusCodes.NOT_FOUND).json({ error: 'Student not found' });
    }
  // Get IST date using dayjs
  const istNow = dayjs().tz('Asia/Kolkata');
  const istMidnight = istNow.startOf('day').toDate();
  const istEnd = istNow.endOf('day').toDate();

    // Find today's ClassSession for student's branch/year/section
    const session = await ClassSession.findOne({
      date: { $gte: istMidnight, $lte: istEnd },
      branch: student.branch?._id,
      year: student.year?._id,
      section: student.section?._id,
      cancelled: false,
      qrGenerated: true
    });
    if (session) {
      return res.json({ held: true, sessionId: session._id });
    } else {
      return res.json({ held: false });
    }
  } catch (err) {
    next(err);
  }
});


// const ClassSession = require('../../models/classSession');

// Generate QR for a specific class session
router.post('/:id/generate-qr', async (req, res) => {
  try {
    const session = await ClassSession.findByIdAndUpdate(
      req.params.id,
      { qrGenerated: true },
      { new: true }
    );
    if (!session) return res.status(404).json({ error: 'ClassSession not found' });
    res.json({ success: true, session });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
