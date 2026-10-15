const UserSkill = require('../models/UserSkill');

/**
 * @desc    Get user's skill inventory
 * @route   GET /api/skills
 * @access  Private
 */
const getSkills = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const skills = await UserSkill.find({ userId }).sort({ category: 1, name: 1 });

    return res.status(200).json({
      success: true,
      data: skills,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Add or update a skill in inventory
 * @route   POST /api/skills
 * @access  Private
 */
const addSkill = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { name, category, proficiency, confidenceScore, status, associatedProjects, verificationNotes } = req.body;

    if (!name || name.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Skill name is required.',
      });
    }

    // Upsert skill for this user
    const skill = await UserSkill.findOneAndUpdate(
      { userId, name: name.trim() },
      {
        $set: {
          category: category || 'Tools & Others',
          proficiency: proficiency || 'Intermediate',
          confidenceScore: confidenceScore !== undefined ? confidenceScore : 3,
          status: status || 'Proficient',
          associatedProjects: associatedProjects || [],
          verificationNotes: verificationNotes || '',
        },
      },
      { new: true, upsert: true, runValidators: true }
    );

    return res.status(201).json({
      success: true,
      message: 'Skill saved successfully',
      data: skill,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update an existing skill
 * @route   PUT /api/skills/:id
 * @access  Private
 */
const updateSkill = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const skill = await UserSkill.findOneAndUpdate(
      { _id: req.params.id, userId },
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!skill) {
      return res.status(404).json({
        success: false,
        message: 'Skill not found or unauthorized.',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Skill updated successfully',
      data: skill,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a skill from inventory
 * @route   DELETE /api/skills/:id
 * @access  Private
 */
const deleteSkill = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const skill = await UserSkill.findOneAndDelete({ _id: req.params.id, userId });

    if (!skill) {
      return res.status(404).json({
        success: false,
        message: 'Skill not found.',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Skill removed from inventory',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Run transparent Skill Gap Analysis against target requirements
 * @route   POST /api/skills/gap-analysis
 * @access  Private
 */
const analyzeSkillGap = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { requiredSkills = [], targetRole = 'Target Role' } = req.body;

    const userSkills = await UserSkill.find({ userId });
    const userSkillMap = new Map();
    userSkills.forEach((s) => {
      userSkillMap.set(s.name.toLowerCase(), s);
    });

    const matched = [];
    const partial = [];
    const missing = [];

    requiredSkills.forEach((reqSkill) => {
      const found = userSkillMap.get(reqSkill.toLowerCase());
      if (!found) {
        missing.push({
          name: reqSkill,
          importance: 'High',
          recommendedAction: `Add ${reqSkill} to your active Learning Plan roadmap`,
        });
      } else if (found.proficiency === 'Beginner' || found.confidenceScore <= 2) {
        partial.push({
          name: reqSkill,
          proficiency: found.proficiency,
          confidenceScore: found.confidenceScore,
          importance: 'Medium',
          recommendedAction: `Complete practice tasks to advance ${reqSkill} to Intermediate level`,
        });
      } else {
        matched.push({
          name: reqSkill,
          proficiency: found.proficiency,
          confidenceScore: found.confidenceScore,
          status: found.status,
          evidence: found.verificationNotes || 'Demonstrated in profile',
        });
      }
    });

    const totalIdentified = requiredSkills.length;
    // Transparent mathematical formula: (matched / total) * 100
    const coveragePercentage =
      totalIdentified > 0 ? Math.round((matched.length / totalIdentified) * 100) : 0;

    return res.status(200).json({
      success: true,
      data: {
        targetRole,
        coveragePercentage,
        totalRequired: totalIdentified,
        matchedSkillsCount: matched.length,
        partialSkillsCount: partial.length,
        missingSkillsCount: missing.length,
        matched,
        partial,
        missing,
        formula: 'Coverage % = (Matched Required Skills / Total Identified Required Skills) × 100',
        disclaimer: 'This measures curriculum skill coverage, not hiring probability.',
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSkills,
  addSkill,
  updateSkill,
  deleteSkill,
  analyzeSkillGap,
};
