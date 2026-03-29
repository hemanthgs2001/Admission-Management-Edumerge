const mongoose = require('mongoose');

const InstitutionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  code: {
    type: String,
    required: true,
    unique: true,
  },
  campuses: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Campus',
  }],
}, {
  timestamps: true,
});

module.exports = mongoose.model('Institution', InstitutionSchema);