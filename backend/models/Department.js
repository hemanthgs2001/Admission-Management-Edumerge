const mongoose = require('mongoose');

const DepartmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  campus: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Campus',
    required: true,
  },
  programs: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Program',
  }],
}, {
  timestamps: true,
});

module.exports = mongoose.model('Department', DepartmentSchema);