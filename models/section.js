const mongoose = require('mongoose');

const sectionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  branch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Branch',
    required: true,
  },
  // You can add more fields if needed (e.g., class teacher, room number, etc.)
});

module.exports = mongoose.model('Section', sectionSchema);
