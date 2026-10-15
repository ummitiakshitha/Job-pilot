const JobDescription = require('../models/JobDescription');
const { decodeJobDescription } = require('../services/aiService');

/**
 * @desc    Decode and extract structured requirements from raw JD text
 * @route   POST /api/job-descriptions/decode
 * @access  Private
 */
const decodeJD = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { rawText, title, company, applicationId } = req.body;

    if (!rawText || rawText.trim().length < 20) {
      return res.status(400).json({
        success: false,
        message: 'Please provide at least 20 characters of job description text to decode.',
      });
    }

    const extracted = decodeJobDescription(rawText, title);

    const record = await JobDescription.create({
      userId,
      applicationId: applicationId || null,
      title: title || extracted.jobTitle || 'Target Role',
      company: company || 'Company',
      rawText,
      extracted,
    });

    return res.status(201).json({
      success: true,
      message: 'Job description decoded and saved successfully',
      data: record,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all decoded job descriptions for authenticated user
 * @route   GET /api/job-descriptions
 * @access  Private
 */
const getJobDescriptions = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const records = await JobDescription.find({ userId })
      .sort({ createdAt: -1 })
      .limit(30);

    return res.status(200).json({
      success: true,
      data: records,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single decoded job description
 * @route   GET /api/job-descriptions/:id
 * @access  Private
 */
const getJobDescriptionById = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const record = await JobDescription.findOne({ _id: req.params.id, userId });

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Job description record not found.',
      });
    }

    return res.status(200).json({
      success: true,
      data: record,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete decoded job description
 * @route   DELETE /api/job-descriptions/:id
 * @access  Private
 */
const deleteJobDescription = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const record = await JobDescription.findOneAndDelete({ _id: req.params.id, userId });

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Job description not found or unauthorized.',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Job description deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  decodeJD,
  getJobDescriptions,
  getJobDescriptionById,
  deleteJobDescription,
};
