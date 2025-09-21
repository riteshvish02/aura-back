const express = require('express');
const router  = express.Router();



router.use('/teacher-admin', require('./teacherAdmin.route'));
router.use('/student', require('./student.route'));
router.use('/classsession', require('./classSession.route'));
router.use('/session', require('./classSession.route'));
router.use('/daily-attendance', require('./dailyAttendance.route'));
router.use('/attendance', require('./attendance.route'));

module.exports = router;

