const mongoose = require('mongoose');

const learningTaskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: String,
  estimatedMinutes: {
    type: Number,
    default: 45,
  },
  resourceTitle: String,
  resourceUrl: String,
  completed: {
    type: Boolean,
    default: false,
  },
  completedAt: Date,
  selfAssessmentQuestion: String,
  userNotes: String,
});

const learningModuleSchema = new mongoose.Schema({
  weekNumber: {
    type: Number,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  goal: String,
  milestones: [String],
  tasks: [learningTaskSchema],
});

const learningPlanSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
    },
    targetRole: {
      type: String,
      required: true,
    },
    interviewDate: Date,
    dailyHoursCommitment: {
      type: Number,
      default: 2,
    },
    targetedSkills: [String],
    modules: [learningModuleSchema],
    overallProgress: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('LearningPlan', learningPlanSchema);
