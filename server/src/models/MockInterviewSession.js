const mongoose = require('mongoose');

const interviewQuestionSchema = new mongoose.Schema({
  questionText: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    enum: ['Technical', 'Behavioral', 'System Design', 'HR & Situational'],
    default: 'Technical',
  },
  userAnswer: {
    type: String,
    default: '',
  },
  timeSpentSeconds: {
    type: Number,
    default: 0,
  },
  score: {
    type: Number,
    min: 0,
    max: 100,
    default: 0,
  },
  strengths: [String],
  improvements: [String],
  missingConcepts: [String],
  modelAnswer: String,
  followUpPractice: String,
  evaluatedAt: Date,
});

const mockInterviewSessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    targetRole: {
      type: String,
      required: true,
    },
    company: {
      type: String,
      default: 'General Tech Company',
    },
    interviewType: {
      type: String,
      enum: ['Technical', 'Behavioral', 'HR', 'Comprehensive'],
      default: 'Technical',
    },
    difficulty: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced'],
      default: 'Intermediate',
    },
    timeAllowedPerQuestion: {
      type: Number,
      default: 180, // seconds
    },
    status: {
      type: String,
      enum: ['In Progress', 'Completed', 'Abandoned'],
      default: 'In Progress',
    },
    questions: [interviewQuestionSchema],
    currentQuestionIndex: {
      type: Number,
      default: 0,
    },
    overallScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    summaryFeedback: {
      summary: String,
      strengths: [String],
      improvements: [String],
      topicsToRevise: [String],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('MockInterviewSession', mockInterviewSessionSchema);
