
const express = require('express');
const router = express.Router();
const { markAttendanceByQR, getStudentTodayAttendance } = require('../../controllers/attendancecontroller');

// Student scans QR to mark attendance
router.post('/mark', markAttendanceByQR);

// Get today's attendance for a student
router.get('/student-today', getStudentTodayAttendance);
// DEBUG: Get all attendance records for today in IST
router.get('/debug-all-today', async (req, res) => {
		try {
			const nowUTC = new Date();
			const IST_OFFSET = 5.5 * 60 * 60 * 1000;
			const todayIST = new Date(nowUTC.getTime() + IST_OFFSET);
			const start = new Date(todayIST.getFullYear(), todayIST.getMonth(), todayIST.getDate(), 0, 0, 0, 0);
			const end = new Date(todayIST.getFullYear(), todayIST.getMonth(), todayIST.getDate(), 23, 59, 59, 999);
			const Attendance = require('../../models/attendance');
			const records = await Attendance.find({ date: { $gte: start, $lte: end } });
			const allRecords = await Attendance.find({});
			console.log('DEBUG ROUTE: IST start:', start, 'IST end:', end);
			console.log('DEBUG ROUTE: Matching records:', records);
			console.log('DEBUG ROUTE: All attendance records:', allRecords);
			res.json({ records, start, end, allRecords });
		} catch (err) {
			res.status(500).json({ error: err.message });
		}
});
module.exports = router;
