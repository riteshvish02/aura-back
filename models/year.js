const mongoose = require('mongoose');

const yearSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  branches: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Branch',
  }],
});

module.exports = mongoose.model('Year', yearSchema);