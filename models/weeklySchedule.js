const mongoose = require('mongoose');

const classSchema = new mongoose.Schema({
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  subject: { type: String, required: true },
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
});

const weekDaySchema = new mongoose.Schema({
  day: {
    type: String,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    required: true,
  },
  classes: [classSchema],
});

const weeklyScheduleSchema = new mongoose.Schema({
  year: { type: mongoose.Schema.Types.ObjectId, ref: 'Year', required: true },
  branch: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch', required: true },
  section: { type: mongoose.Schema.Types.ObjectId, ref: 'Section', required: true },
  week: [weekDaySchema],
});

module.exports = mongoose.model('WeeklySchedule', weeklyScheduleSchema);
