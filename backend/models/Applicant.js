const mongoose = require('mongoose');

const ApplicantSchema = new mongoose.Schema({
  // Basic Details (15 fields maximum)
  fullName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  dateOfBirth: {
    type: Date,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  state: {
    type: String,
    required: true,
  },
  pincode: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    enum: ['GM', 'SC', 'ST', 'OBC'],
    required: true,
  },
  entryType: {
    type: String,
    enum: ['Regular', 'Lateral'],
    required: true,
  },
  quotaType: {
    type: String,
    enum: ['KCET', 'COMEDK', 'Management'],
    required: true,
  },
  marks: {
    type: Number,
    required: true,
  },
  allotmentNumber: {
    type: String,
  },
  // Document tracking
  documents: {
    status: {
      type: String,
      enum: ['Pending', 'Submitted', 'Verified'],
      default: 'Pending',
    },
    remarks: {
      type: String,
    },
  },
  // Program allocation
  program: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Program',
  },
  // Admission details
  admissionNumber: {
    type: String,
    unique: true,
    sparse: true,
  },
  feeStatus: {
    type: String,
    enum: ['Pending', 'Paid'],
    default: 'Pending',
  },
  admissionStatus: {
    type: String,
    enum: ['Pending', 'Allocated', 'Confirmed'],
    default: 'Pending',
  },
  allocationDate: {
    type: Date,
  },
  confirmationDate: {
    type: Date,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Applicant', ApplicantSchema);