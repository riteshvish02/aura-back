const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true,
  },
  schedule: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ClassSession',
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ['present', 'absent', 'late'],
    default: 'present',
  },
  markedAt: {
    type: Date,
    default: Date.now,
  },
  // You can add more fields if needed (e.g., markedBy, QR info)
});

module.exports = mongoose.model('Attendance', attendanceSchema);
