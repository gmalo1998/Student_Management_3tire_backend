const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    // ========================================
    // USER INFORMATION
    // ========================================

    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
    },

    // ========================================
    // USER ACCESS / ROLE
    // ========================================

    role: {
      type: String,
      enum: ['admin', 'user'],
      default: 'user',
    },

    status: {
      type: String,
      enum: ['Active', 'Inactive'],
      default: 'Active',
    },

    // ========================================
    // LOGIN INFORMATION
    // ========================================

    lastLoginAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('User', userSchema);