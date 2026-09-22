const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema(
  {
    // ========================================
    // STUDENT IDENTIFICATION
    // ========================================

    studentId: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },

    // ========================================
    // PERSONAL INFORMATION
    // ========================================

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

    // ========================================
    // ACADEMIC INFORMATION
    // ========================================

    department: {
      type: String,
      required: true,
      trim: true
    },

    stream: {
      type: String,
      required: true,
      trim: true
    },

    course: {
      type: String,
      required: true,
      trim: true
    },

    specialization: {
      type: String,
      default: '',
      trim: true
    },

    batch: {
      type: String,
      required: true,
      trim: true
    },

    year: {
      type: String,
      required: true,
      trim: true
    },

    semester: {
      type: String,
      default: ''
    },

    section: {
      type: String,
      default: ''
    },

    // ========================================
    // ENROLLMENT INFORMATION
    // ========================================

    admissionNumber: {
      type: String,
      default: '',
      trim: true
    },

    rollNumber: {
      type: String,
      default: '',
      trim: true
    },

    admissionDate: {
      type: Date
    },

    joiningDate: {
      type: Date
    },

    graduationYear: {
      type: String,
      default: ''
    },

    // ========================================
    // GUARDIAN INFORMATION
    // ========================================

    guardianName: {
      type: String,
      default: '',
      trim: true
    },

    guardianRelationship: {
      type: String,
      enum: [
        '',
        'Father',
        'Mother',
        'Guardian',
        'Other'
      ],
      default: ''
    },

    guardianPhone: {
      type: String,
      default: '',
      trim: true
    },

    // ========================================
    // ADDRESS
    // ========================================

    address: {
      type: String,
      default: '',
      trim: true
    },

    // ========================================
    // ACCOUNT STATUS
    // ========================================

    status: {
      type: String,
      enum: [
        'Active',
        'Pending',
        'Inactive',
        'Graduated',
        'Suspended',
        'Transferred',
        'Dropped'
      ],
      default: 'Active'
    }
  },
  {
    timestamps: true
  }
);

// ========================================
// INDEXES
// ========================================

studentSchema.index({ department: 1 });
studentSchema.index({ course: 1 });
studentSchema.index({ batch: 1 });
studentSchema.index({ status: 1 });

module.exports = mongoose.model(
  'Student',
  studentSchema
);