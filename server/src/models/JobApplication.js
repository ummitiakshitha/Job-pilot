const mongoose = require('mongoose');

const STATUS_VALUES = ['Applied', 'Interview', 'Offer', 'Rejected'];

const jobApplicationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID reference is required'],
      index: true,
    },
    company: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
      maxlength: [120, 'Company name cannot exceed 120 characters'],
    },
    role: {
      type: String,
      required: [true, 'Job role is required'],
      trim: true,
      maxlength: [120, 'Job role cannot exceed 120 characters'],
    },
    jobLink: {
      type: String,
      trim: true,
      default: '',
    },
    salaryExpectation: {
      type: Number,
      min: [0, 'Salary expectation cannot be negative'],
      default: null,
    },
    applicationDate: {
      type: Date,
      required: [true, 'Application date is required'],
      default: Date.now,
    },
    status: {
      type: String,
      enum: {
        values: STATUS_VALUES,
        message: '{VALUE} is not a valid status. Valid statuses are: Applied, Interview, Offer, Rejected',
      },
      default: 'Applied',
      required: [true, 'Status is required'],
      index: true,
    },
    interviewDate: {
      type: Date,
      default: null,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [2000, 'Notes cannot exceed 2000 characters'],
      default: '',
    },
    // Feature 4: Interview Preparation Checklist
    checklist: [
      {
        id: { type: String, required: true },
        text: { type: String, required: true, trim: true },
        completed: { type: Boolean, default: false },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    // Feature 5: Follow-Up Reminders
    followUpDate: {
      type: Date,
      default: null,
    },
    followUpCompleted: {
      type: Boolean,
      default: false,
    },
    // Feature 6: Confirmed Offer Salary Compensation
    offeredSalary: {
      type: Number,
      min: [0, 'Offered salary cannot be negative'],
      default: null,
    },
    // Feature 9: Bookmarking & Favorites
    isFavorite: {
      type: Boolean,
      default: false,
      index: true,
    },
    // Feature 8: Real Activity Timeline
    activityHistory: [
      {
        action: { type: String, required: true },
        description: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc, ret) => {
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Compound indexes for user-specific search, filtering and sorting
jobApplicationSchema.index({ userId: 1, status: 1 });
jobApplicationSchema.index({ userId: 1, applicationDate: -1 });
jobApplicationSchema.index({ userId: 1, company: 'text', role: 'text' });

const JobApplication = mongoose.model('JobApplication', jobApplicationSchema);
module.exports = JobApplication;
module.exports.STATUS_VALUES = STATUS_VALUES;
