const mongoose = require('mongoose');

const ProgramSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  code: {
    type: String,
    required: true,
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: true,
  },
  academicYear: {
    type: String,
    required: true,
  },
  courseType: {
    type: String,
    enum: ['UG', 'PG'],
    required: true,
  },
  entryType: {
    type: String,
    enum: ['Regular', 'Lateral'],
    required: true,
  },
  totalIntake: {
    type: Number,
    required: true,
  },
  quotas: [{
    name: {
      type: String,
      enum: ['KCET', 'COMEDK', 'Management'],
      required: true,
    },
    seats: {
      type: Number,
      required: true,
    },
    filled: {
      type: Number,
      default: 0,
    },
  }],
  supernumerarySeats: {
    type: Number,
    default: 0,
  },
  supernumeraryFilled: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Program', ProgramSchema);