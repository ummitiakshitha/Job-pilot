const mongoose = require('mongoose');

const jobDescriptionSchema = new mongoose.Schema(
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
    title: {
      type: String,
      required: true,
      trim: true,
    },
    company: {
      type: String,
      default: 'Target Company',
      trim: true,
    },
    rawText: {
      type: String,
      required: true,
    },
    extracted: {
      jobTitle: String,
      requiredSkills: [String],
      preferredSkills: [String],
      technicalConcepts: [String],
      toolsAndTechnologies: [String],
      experienceRequirements: String,
      educationRequirements: String,
      responsibilities: [String],
      keyKeywords: [String],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('JobDescription', jobDescriptionSchema);
