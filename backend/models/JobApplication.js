const mongoose = require('mongoose');

/**
 * JobApplication Schema — normalized MongoDB schema
 * Stores job applications submitted through the job application form.
 */
const jobApplicationSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      maxlength: [100, 'Full name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
      match: [/^[\d\s\+\-\(\)]{7,20}$/, 'Please enter a valid phone number'],
    },
    coverLetter: {
      type: String,
      required: [true, 'Cover letter is required'],
      minlength: [50, 'Cover letter must be at least 50 characters'],
      maxlength: [5000, 'Cover letter cannot exceed 5000 characters'],
    },
    resumeFileName: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: ['pending', 'reviewed', 'shortlisted', 'rejected'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('JobApplication', jobApplicationSchema);
