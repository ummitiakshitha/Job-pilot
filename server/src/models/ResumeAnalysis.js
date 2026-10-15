const mongoose = require('mongoose');

const resumeAnalysisSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    applicationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'JobApplication',
      default: null,
    },
    filename: {
      type: String,
      required: true,
    },
    targetRole: {
      type: String,
      required: true,
      trim: true,
    },
    jobDescription: {
      type: String,
      default: '',
    },
    rawTextLength: {
      type: Number,
      default: 0,
    },
    sectionsFound: [
      {
        type: String,
      },
    ],
    matchScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    keywordCoverage: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    matchedSkills: [
      {
        type: String,
      },
    ],
    missingSkills: [
      {
        type: String,
      },
    ],
    bulletSuggestions: [
      {
        original: String,
        improved: String,
        rationale: String,
      },
    ],
    improvementChecklist: [
      {
        category: String,
        suggestion: String,
        priority: {
          type: String,
          enum: ['High', 'Medium', 'Low'],
          default: 'Medium',
        },
      },
    ],
    formattingAudit: {
      hasEmail: Boolean,
      hasPhone: Boolean,
      hasLinkedIn: Boolean,
      hasGitHub: Boolean,
      wordCount: Number,
      readingTimeMinutes: Number,
    },
    calculationNotes: {
      formula: String,
      engine: {
        type: String,
        enum: ['Rule-Based NLP', 'Gemini AI Provider'],
        default: 'Rule-Based NLP',
      },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('ResumeAnalysis', resumeAnalysisSchema);
