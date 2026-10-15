const ResumeAnalysis = require('../models/ResumeAnalysis');
const { extractTextFromPDF, analyzeResumeAgainstJD } = require('../services/aiService');

/**
 * @desc    Upload and analyze resume PDF against job role / JD
 * @route   POST /api/resume/analyze
 * @access  Private
 */
const analyzeResume = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { targetRole, jobDescription, applicationId } = req.body;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a valid PDF resume file.',
      });
    }

    if (!targetRole || targetRole.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Target job role is required.',
      });
    }

    // Extract text from uploaded PDF buffer
    const pdfResult = await extractTextFromPDF(req.file.buffer);
    if (!pdfResult.success || !pdfResult.text) {
      return res.status(422).json({
        success: false,
        message: 'Could not extract readable text from the uploaded PDF. Ensure it is not a scanned image.',
        error: pdfResult.error,
      });
    }

    // Run heuristic analysis against JD
    const analysis = analyzeResumeAgainstJD(
      pdfResult.text,
      jobDescription || targetRole,
      targetRole
    );

    // Save record to MongoDB
    const record = await ResumeAnalysis.create({
      userId,
      applicationId: applicationId || null,
      filename: req.file.originalname || 'resume.pdf',
      targetRole,
      jobDescription: jobDescription || '',
      rawTextLength: pdfResult.charCount,
      sectionsFound: analysis.sectionsFound,
      matchScore: analysis.matchScore,
      keywordCoverage: analysis.keywordCoverage,
      matchedSkills: analysis.matchedSkills,
      missingSkills: analysis.missingSkills,
      bulletSuggestions: analysis.bulletSuggestions,
      improvementChecklist: analysis.improvementChecklist,
      formattingAudit: analysis.formattingAudit,
      calculationNotes: analysis.calculationNotes,
    });

    return res.status(201).json({
      success: true,
      message: 'Resume analyzed successfully',
      data: record,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all resume analyses for logged in user
 * @route   GET /api/resume/analyses
 * @access  Private
 */
const getAnalyses = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const records = await ResumeAnalysis.find({ userId })
      .sort({ createdAt: -1 })
      .limit(20);

    return res.status(200).json({
      success: true,
      data: records,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single resume analysis by ID
 * @route   GET /api/resume/analyses/:id
 * @access  Private
 */
const getAnalysisById = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const record = await ResumeAnalysis.findOne({ _id: req.params.id, userId });

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Resume analysis record not found.',
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
 * @desc    Delete a resume analysis
 * @route   DELETE /api/resume/analyses/:id
 * @access  Private
 */
const deleteAnalysis = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const record = await ResumeAnalysis.findOneAndDelete({ _id: req.params.id, userId });

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Resume analysis not found or unauthorized.',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Analysis deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  analyzeResume,
  getAnalyses,
  getAnalysisById,
  deleteAnalysis,
};
