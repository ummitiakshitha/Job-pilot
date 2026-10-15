const STARAnswer = require('../models/STARAnswer');

/**
 * Helper to analyze and score STAR completeness
 */
const evaluateSTARCompleteness = (situation, task, action, result) => {
  let score = 0;
  const clarityTips = [];
  const metricsSuggestions = [];

  const sitWords = (situation || '').split(/\s+/).filter(Boolean).length;
  const taskWords = (task || '').split(/\s+/).filter(Boolean).length;
  const actWords = (action || '').split(/\s+/).filter(Boolean).length;
  const resWords = (result || '').split(/\s+/).filter(Boolean).length;

  if (sitWords >= 15) score += 25;
  else clarityTips.push('Elaborate on the background context and problem scope in Situation.');

  if (taskWords >= 10) score += 25;
  else clarityTips.push('Clearly define your specific ownership and role expectations in Task.');

  if (actWords >= 25) score += 25;
  else clarityTips.push('Detail the specific technical and leadership actions you personally took.');

  if (resWords >= 15) score += 25;
  else clarityTips.push('State what happened and what lessons or skills you developed in Result.');

  // Check for metrics or quantification in Result and Action
  const combined = `${situation} ${task} ${action} ${result}`;
  const hasNumbers = /\b\d+(?:\.\d+)?%?|\b(?:doubled|halved|reduced|increased)\b/i.test(combined);
  if (!hasNumbers) {
    metricsSuggestions.push('Add quantitative evidence: e.g. "reduced load time by 35%", "scaled to 5,000 users", or "saved 4 hours weekly".');
  } else {
    metricsSuggestions.push('Strong numerical impact detected.');
  }

  return {
    completenessScore: score,
    clarityTips,
    metricsSuggestions,
  };
};

/**
 * @desc    Create a new STAR behavioral answer
 * @route   POST /api/star-answers
 * @access  Private
 */
const createSTARAnswer = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { title, competency, situation, task, action, result, tags } = req.body;

    if (!title || !situation || !task || !action || !result) {
      return res.status(400).json({
        success: false,
        message: 'Title, Situation, Task, Action, and Result are all required.',
      });
    }

    const { completenessScore, clarityTips, metricsSuggestions } = evaluateSTARCompleteness(
      situation,
      task,
      action,
      result
    );

    const combinedAnswer = `[Situation]: ${situation.trim()}\n\n[Task]: ${task.trim()}\n\n[Action]: ${action.trim()}\n\n[Result]: ${result.trim()}`;

    const star = await STARAnswer.create({
      userId,
      title: title.trim(),
      competency: competency || 'Problem Solving',
      situation: situation.trim(),
      task: task.trim(),
      action: action.trim(),
      result: result.trim(),
      combinedAnswer,
      completenessScore,
      clarityTips,
      metricsSuggestions,
      tags: tags || [],
    });

    return res.status(201).json({
      success: true,
      message: 'STAR answer story saved successfully',
      data: star,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all STAR answers for logged in user
 * @route   GET /api/star-answers
 * @access  Private
 */
const getSTARAnswers = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const records = await STARAnswer.find({ userId }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: records,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update an existing STAR answer
 * @route   PUT /api/star-answers/:id
 * @access  Private
 */
const updateSTARAnswer = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { title, competency, situation, task, action, result, tags } = req.body;

    const star = await STARAnswer.findOne({ _id: req.params.id, userId });
    if (!star) {
      return res.status(404).json({
        success: false,
        message: 'STAR answer not found.',
      });
    }

    if (title) star.title = title.trim();
    if (competency) star.competency = competency;
    if (situation) star.situation = situation.trim();
    if (task) star.task = task.trim();
    if (action) star.action = action.trim();
    if (result) star.result = result.trim();
    if (tags) star.tags = tags;

    const { completenessScore, clarityTips, metricsSuggestions } = evaluateSTARCompleteness(
      star.situation,
      star.task,
      star.action,
      star.result
    );

    star.completenessScore = completenessScore;
    star.clarityTips = clarityTips;
    star.metricsSuggestions = metricsSuggestions;
    star.combinedAnswer = `[Situation]: ${star.situation}\n\n[Task]: ${star.task}\n\n[Action]: ${star.action}\n\n[Result]: ${star.result}`;

    await star.save();

    return res.status(200).json({
      success: true,
      message: 'STAR answer updated successfully',
      data: star,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a STAR answer
 * @route   DELETE /api/star-answers/:id
 * @access  Private
 */
const deleteSTARAnswer = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const star = await STARAnswer.findOneAndDelete({ _id: req.params.id, userId });

    if (!star) {
      return res.status(404).json({
        success: false,
        message: 'STAR answer not found.',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'STAR answer removed.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createSTARAnswer,
  getSTARAnswers,
  updateSTARAnswer,
  deleteSTARAnswer,
};
