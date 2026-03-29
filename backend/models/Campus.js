const mongoose = require('mongoose');

const CampusSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  institution: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Institution',
    required: true,
  },
  departments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
  }],
}, {
  timestamps: true,
});

module.exports = mongoose.model('Campus', CampusSchema);