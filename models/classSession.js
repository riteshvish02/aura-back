const mongoose = require('mongoose');

const classSessionSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true
  },
  period: {
    type: Number,
    required: true
  },
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: true
  },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  section: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Section',
    required: true
  },
  branch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Branch',
    required: true
  },
  year: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Year',
    required: true
  },
  qrGenerated: {
    type: Boolean,
    default: false
  },
  cancelled: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

module.exports = mongoose.model('ClassSession', classSessionSchema);