const mongoose = require('mongoose');

const starAnswerSchema = new mongoose.Schema(
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
      trim: true,
    },
    competency: {
      type: String,
      required: true,
      trim: true,
      default: 'Leadership & Problem Solving',
    },
    situation: {
      type: String,
      required: true,
    },
    task: {
      type: String,
      required: true,
    },
    action: {
      type: String,
      required: true,
    },
    result: {
      type: String,
      required: true,
    },
    combinedAnswer: {
      type: String,
      default: '',
    },
    completenessScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    clarityTips: [String],
    metricsSuggestions: [String],
    tags: [String],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('STARAnswer', starAnswerSchema);
