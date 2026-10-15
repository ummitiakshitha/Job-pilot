const mongoose = require('mongoose');

const practiceAttemptSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    questionId: {
      type: String,
      required: true,
      index: true,
    },
    topic: {
      type: String,
      required: true,
      enum: [
        'Data Structures & Algorithms',
        'DBMS & SQL',
        'Operating Systems',
        'Computer Networks',
        'Object-Oriented Programming',
        'Full Stack & Web Dev',
        'JavaScript & React',
        'System Design',
      ],
    },
    difficulty: {
      type: String,
      enum: ['Easy', 'Medium', 'Hard'],
      default: 'Medium',
    },
    status: {
      type: String,
      enum: ['Solved', 'Attempted', 'Bookmarked'],
      default: 'Solved',
    },
    userNotes: {
      type: String,
      default: '',
    },
    timeSpentSeconds: {
      type: Number,
      default: 0,
    },
    selfRating: {
      type: Number,
      min: 1,
      max: 5,
      default: 3,
    },
  },
  {
    timestamps: true,
  }
);

practiceAttemptSchema.index({ userId: 1, questionId: 1 }, { unique: true });

module.exports = {
  PracticeAttempt: mongoose.model('PracticeAttempt', practiceAttemptSchema),
};
