

const { catchAsyncError } = require("../middlewares");
const { StatusCodes } = require("http-status-codes");
const { SuccessResponse, ErrorResponse } = require("../utils/common");
const { ErrorHandler } = require("../utils");
const Year = require('../models/year');
const Branch = require('../models/branch');
const Section = require('../models/section');
const WeeklySchedule = require("../models/weeklySchedule");
const ClassSession = require('../models/classSession');

// API to get teacher's weekly schedule (for dashboard)
exports.getTeacherWeeklySchedule = catchAsyncError(async (req, res, next) => {
	// For demo, fetch all weekly schedules. In real app, filter by teacher/userId.
	const schedules = await WeeklySchedule.find({})
		.populate('year branch section week.classes.teacher', 'userName email')
		.lean();
	// Format for frontend: [{ day, classes: [{ startTime, endTime, subjectName, teacherName }] }]
	let weekData = [];
	if (schedules.length > 0) {
		// Just show first schedule for demo
		weekData = await Promise.all(schedules[0].week.map(async dayObj => ({
			day: dayObj.day,
			classes: await Promise.all(dayObj.classes.map(async cls => {
				let subjectName = cls.subject;
				// If subject is ObjectId, fetch name
				if (typeof cls.subject === 'string' && cls.subject.length === 24) {
					try {
						const Subject = require('../models/subject');
						const subjDoc = await Subject.findById(cls.subject).lean();
						if (subjDoc && subjDoc.name) subjectName = subjDoc.name;
					} catch {}
				}
				return {
					startTime: cls.startTime,
					endTime: cls.endTime,
					subjectName,
					teacherName: cls.teacher?.userName || 'Teacher',
				};
			}))
		})));
	}
	return res.status(200).json({ schedule: weekData });
});

// Create Weekly Schedule (all week at once)
exports.createWeeklySchedule = catchAsyncError(async (req, res, next) => {
	const { year, branch, section, week } = req.body;
	if (!year || !branch || !section || !Array.isArray(week) || week.length === 0) {
		return next(new ErrorHandler("All fields (year, branch, section, week) are required", StatusCodes.BAD_REQUEST));
	}
	// Validate week array structure
	for (const dayObj of week) {
		if (!dayObj.day || !Array.isArray(dayObj.classes)) {
			return next(new ErrorHandler("Each week entry must have a day and classes array", StatusCodes.BAD_REQUEST));
		}
		for (const cls of dayObj.classes) {
			if (!cls.startTime || !cls.endTime || !cls.subject || !cls.teacher) {
				return next(new ErrorHandler("Each class must have startTime, endTime, subject, and teacher", StatusCodes.BAD_REQUEST));
			}
		}
	}
	const weeklySchedule = new WeeklySchedule({ year, branch, section, week });
	await weeklySchedule.save();
	SuccessResponse.data = weeklySchedule;
	SuccessResponse.message = "Weekly schedule created successfully";
	return res.status(StatusCodes.CREATED).json({ SuccessResponse });
});


// Mark QR as generated for a class session (held)
exports.markQRGenerated = catchAsyncError(async (req, res, next) => {
	console.log(req.body);
	const { date, period, subject, teacher, section, branch, year } = req.body;
	let _section = section, _branch = branch, _year = year;
	if (!subject || typeof subject !== 'string') {
		return next(new ErrorHandler("Subject name required as string", StatusCodes.BAD_REQUEST));
	}
	const Subject = require('../models/subject');
	const subjDoc = await Subject.findOne({ name: subject });
	if (!subjDoc) {
		return next(new ErrorHandler("Subject not found", StatusCodes.BAD_REQUEST));
	}
	const subjectId = subjDoc._id;
	if (!section || !branch || !year) {
		const User = require('../models/user');
		const teacherDoc = await User.findById(teacher);
		if (!teacherDoc) {
			return next(new ErrorHandler("Teacher not found", StatusCodes.BAD_REQUEST));
		}
		_section = teacherDoc.section || _section;
		_branch = teacherDoc.branch || _branch;
		_year = teacherDoc.year || _year;
	}
	if (!_section || !_branch || !_year) {
		return next(new ErrorHandler("Section, branch, year required", StatusCodes.BAD_REQUEST));
	}
		// Always save date in IST midnight (start of day)
		const dayjs = require('dayjs');
		const utc = require('dayjs/plugin/utc');
		const timezone = require('dayjs/plugin/timezone');
		dayjs.extend(utc);
		dayjs.extend(timezone);
		const dateISTMidnight = dayjs(date).tz('Asia/Kolkata').startOf('day').toDate();
		// Find or create ClassSession for this class instance
		let session = await ClassSession.findOne({
		date: { $gte: dateISTMidnight, $lte: dayjs(dateISTMidnight).endOf('day').toDate() },
			period,
			subject: subjectId,
			teacher,
			section: _section,
			branch: _branch,
			year: _year
		});
		if (!session) {
			session = new ClassSession({ date: dateISTMidnight, period, subject: subjectId, teacher, section: _section, branch: _branch, year: _year, qrGenerated: true });
			await session.save();
		} else {
			session.qrGenerated = true;
			session.cancelled = false;
			await session.save();
		}
	// Always return the real sessionId for QR
	SuccessResponse.data = { session, sessionId: session._id };
	SuccessResponse.message = "QR marked as generated (class held). Use sessionId for attendance.";
	return res.status(StatusCodes.OK).json({ SuccessResponse });
});