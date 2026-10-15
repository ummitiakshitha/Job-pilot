const mongoose = require('mongoose');

const userSkillSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      enum: [
        'Programming Languages',
        'Frontend',
        'Backend',
        'Databases',
        'Cloud & DevOps',
        'Core CS Fundamentals',
        'Soft Skills',
        'Tools & Others',
      ],
      default: 'Tools & Others',
    },
    proficiency: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
      default: 'Intermediate',
    },
    confidenceScore: {
      type: Number,
      min: 1,
      max: 5,
      default: 3,
    },
    status: {
      type: String,
      enum: ['Identified Gap', 'Learning', 'Proficient', 'Mastered'],
      default: 'Proficient',
    },
    associatedProjects: [String],
    verificationNotes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

userSkillSchema.index({ userId: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('UserSkill', userSkillSchema);
