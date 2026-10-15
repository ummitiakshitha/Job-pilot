const LearningPlan = require('../models/LearningPlan');
const { generateLearningPlan } = require('../services/aiService');

/**
 * @desc    Generate and save a personalized learning roadmap from missing skills
 * @route   POST /api/learning-plans/generate
 * @access  Private
 */
const createPlan = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { targetRole, missingSkills, dailyHours, interviewDate } = req.body;

    const planTemplate = generateLearningPlan(
      targetRole || 'Software Development Engineer',
      missingSkills || [],
      dailyHours || 2
    );

    const plan = await LearningPlan.create({
      userId,
      title: planTemplate.title,
      targetRole: planTemplate.targetRole,
      dailyHoursCommitment: planTemplate.dailyHoursCommitment,
      interviewDate: interviewDate || null,
      targetedSkills: planTemplate.targetedSkills,
      modules: planTemplate.modules,
      overallProgress: 0,
    });

    return res.status(201).json({
      success: true,
      message: 'Personalized learning plan generated successfully',
      data: plan,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get user's learning plans (latest active first)
 * @route   GET /api/learning-plans
 * @access  Private
 */
const getPlans = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const plans = await LearningPlan.find({ userId }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: plans,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Toggle a task completion inside a learning plan
 * @route   PATCH /api/learning-plans/:planId/tasks/:taskId
 * @access  Private
 */
const toggleTaskCompletion = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { planId, taskId } = req.params;
    const { notes } = req.body;

    const plan = await LearningPlan.findOne({ _id: planId, userId });
    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Learning plan not found.',
      });
    }

    let foundTask = null;
    let totalTasks = 0;
    let completedTasks = 0;

    plan.modules.forEach((mod) => {
      mod.tasks.forEach((t) => {
        totalTasks += 1;
        if (t._id.toString() === taskId) {
          t.completed = !t.completed;
          t.completedAt = t.completed ? new Date() : null;
          if (notes !== undefined) t.userNotes = notes;
          foundTask = t;
        }
        if (t.completed) completedTasks += 1;
      });
    });

    if (!foundTask) {
      return res.status(404).json({
        success: false,
        message: 'Task not found in plan.',
      });
    }

    plan.overallProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    await plan.save();

    return res.status(200).json({
      success: true,
      message: foundTask.completed ? 'Task marked complete' : 'Task marked incomplete',
      data: {
        task: foundTask,
        overallProgress: plan.overallProgress,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a learning plan
 * @route   DELETE /api/learning-plans/:id
 * @access  Private
 */
const deletePlan = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const plan = await LearningPlan.findOneAndDelete({ _id: req.params.id, userId });

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Learning plan not found.',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Learning plan removed.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createPlan,
  getPlans,
  toggleTaskCompletion,
  deletePlan,
};
