const MockInterviewSession = require('../models/MockInterviewSession');
const { generateInterviewQuestions, evaluateAnswer } = require('../services/aiService');

/**
 * @desc    Start a new mock interview session with tailored questions
 * @route   POST /api/interviews/start
 * @access  Private
 */
const startInterview = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { targetRole, company, interviewType, difficulty, questionCount, timeAllowedPerQuestion } = req.body;

    const count = Math.min(6, Math.max(2, questionCount || 3));
    const generatedQuestions = generateInterviewQuestions(
      interviewType || 'Technical',
      difficulty || 'Intermediate',
      count
    );

    const questionsFormatted = generatedQuestions.map((q) => ({
      questionText: q.questionText,
      category: q.category,
      userAnswer: '',
      score: 0,
      modelAnswer: q.modelAnswer,
      followUpPractice: q.followUpPractice,
      missingConcepts: q.keywords || [],
    }));

    const session = await MockInterviewSession.create({
      userId,
      targetRole: targetRole || 'Full Stack Engineer',
      company: company || 'Tech Opportunity',
      interviewType: interviewType || 'Technical',
      difficulty: difficulty || 'Intermediate',
      timeAllowedPerQuestion: timeAllowedPerQuestion || 180,
      status: 'In Progress',
      questions: questionsFormatted,
      currentQuestionIndex: 0,
      overallScore: 0,
    });

    return res.status(201).json({
      success: true,
      message: 'Mock interview session initialized',
      data: session,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Submit an answer for current question and receive evaluation
 * @route   POST /api/interviews/:sessionId/answer
 * @access  Private
 */
const submitAnswer = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { sessionId } = req.params;
    const { questionIndex, answerText, timeSpentSeconds } = req.body;

    const session = await MockInterviewSession.findOne({ _id: sessionId, userId });
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Interview session not found.',
      });
    }

    if (session.status === 'Completed') {
      return res.status(400).json({
        success: false,
        message: 'This interview session has already been completed.',
      });
    }

    const idx = questionIndex !== undefined ? questionIndex : session.currentQuestionIndex;
    const question = session.questions[idx];

    if (!question) {
      return res.status(400).json({
        success: false,
        message: 'Invalid question index.',
      });
    }

    // Evaluate answer
    const evalResult = evaluateAnswer(
      question.questionText,
      answerText,
      question.category,
      question.modelAnswer,
      question.missingConcepts
    );

    question.userAnswer = answerText;
    question.timeSpentSeconds = timeSpentSeconds || 0;
    question.score = evalResult.score;
    question.strengths = evalResult.strengths;
    question.improvements = evalResult.improvements;
    question.missingConcepts = evalResult.missingConcepts;
    question.modelAnswer = evalResult.modelAnswer;
    question.followUpPractice = evalResult.followUpPractice;
    question.evaluatedAt = new Date();

    // Advance question index if not at the end
    if (session.currentQuestionIndex < session.questions.length - 1) {
      session.currentQuestionIndex += 1;
    }

    await session.save();

    return res.status(200).json({
      success: true,
      message: 'Answer evaluated successfully',
      data: {
        evaluation: evalResult,
        currentQuestionIndex: session.currentQuestionIndex,
        isLastQuestion: idx === session.questions.length - 1,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Finalize and conclude an interview session
 * @route   POST /api/interviews/:sessionId/complete
 * @access  Private
 */
const completeInterview = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { sessionId } = req.params;

    const session = await MockInterviewSession.findOne({ _id: sessionId, userId });
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Interview session not found.',
      });
    }

    // Calculate overall average score
    const totalScore = session.questions.reduce((acc, q) => acc + (q.score || 0), 0);
    const overallScore = session.questions.length > 0 ? Math.round(totalScore / session.questions.length) : 0;

    session.overallScore = overallScore;
    session.status = 'Completed';

    // Aggregate strengths, improvements, topics to revise
    const allStrengths = new Set();
    const allImprovements = new Set();
    const topicsToRevise = new Set();

    session.questions.forEach((q) => {
      q.strengths.forEach((s) => allStrengths.add(s));
      q.improvements.forEach((i) => allImprovements.add(i));
      q.missingConcepts.forEach((m) => topicsToRevise.add(m));
    });

    session.summaryFeedback = {
      summary: `Completed ${session.questions.length} questions in ${session.interviewType} format with an overall performance score of ${overallScore}%.`,
      strengths: Array.from(allStrengths).slice(0, 4),
      improvements: Array.from(allImprovements).slice(0, 4),
      topicsToRevise: Array.from(topicsToRevise).slice(0, 5),
    };

    await session.save();

    return res.status(200).json({
      success: true,
      message: 'Interview session concluded',
      data: session,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get interview session history
 * @route   GET /api/interviews
 * @access  Private
 */
const getInterviews = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const sessions = await MockInterviewSession.find({ userId })
      .sort({ createdAt: -1 })
      .limit(20);

    return res.status(200).json({
      success: true,
      data: sessions,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single session by ID
 * @route   GET /api/interviews/:sessionId
 * @access  Private
 */
const getInterviewById = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const session = await MockInterviewSession.findOne({ _id: req.params.sessionId, userId });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found.',
      });
    }

    return res.status(200).json({
      success: true,
      data: session,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  startInterview,
  submitAnswer,
  completeInterview,
  getInterviews,
  getInterviewById,
};
