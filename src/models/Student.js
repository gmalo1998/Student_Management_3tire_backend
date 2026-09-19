const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema(
  {
    studentId: {
      type: String,
      required: true,
      unique: true
    },

    name: {
      type: String,
      required: true,
      trim: true
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },

    phone: {
      type: String,
      required: true,
      trim: true
    },

    dob: {
      type: Date
    },

    gender: {
      type: String,
      enum: ['', 'Male', 'Female', 'Other'],
      default: ''
    },

    course: {
      type: String,
      required: true
    },

    year: {
      type: String,
      required: true
    },

    address: {
      type: String,
      default: ''
    },

    status: {
      type: String,
      enum: ['Active', 'Pending', 'Inactive'],
      default: 'Active'
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Student', studentSchema);