const JobApplication = require('../models/JobApplication');
const ResumeAnalysis = require('../models/ResumeAnalysis');
const UserSkill = require('../models/UserSkill');
const LearningPlan = require('../models/LearningPlan');
const MockInterviewSession = require('../models/MockInterviewSession');
const { PracticeAttempt } = require('../models/PracticeLab');

/**
 * @desc    Compute unified Career Readiness metrics from stored database records
 * @route   GET /api/career-readiness
 * @access  Private
 */
const getCareerReadiness = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // 1. Applications & Upcoming Interviews
    const [applications, upcomingApps] = await Promise.all([
      JobApplication.find({ userId }),
      JobApplication.find({
        userId,
        interviewDate: { $gte: new Date() },
      }).sort({ interviewDate: 1 }),
    ]);

    // 2. Resume Analyses
    const latestResume = await ResumeAnalysis.findOne({ userId }).sort({ createdAt: -1 });
    const resumeCount = await ResumeAnalysis.countDocuments({ userId });
    const resumeScore = latestResume ? latestResume.matchScore : 0;

    // 3. User Skills
    const userSkills = await UserSkill.find({ userId });
    const totalSkills = userSkills.length;
    const proficientSkills = userSkills.filter((s) => s.status === 'Proficient' || s.status === 'Mastered').length;
    const learningSkills = userSkills.filter((s) => s.status === 'Learning' || s.status === 'Identified Gap').length;
    const skillCoverage = totalSkills > 0 ? Math.round((proficientSkills / totalSkills) * 100) : 0;

    // 4. Learning Plans
    const latestPlan = await LearningPlan.findOne({ userId }).sort({ createdAt: -1 });
    const learningPlanProgress = latestPlan ? latestPlan.overallProgress : 0;

    // 5. Mock Interview Sessions
    const interviews = await MockInterviewSession.find({ userId, status: 'Completed' });
    const interviewCount = interviews.length;
    const averageInterviewScore =
      interviewCount > 0
        ? Math.round(interviews.reduce((acc, curr) => acc + (curr.overallScore || 0), 0) / interviewCount)
        : 0;

    // 6. Practice Lab Solved Questions
    const solvedQuestions = await PracticeAttempt.countDocuments({ userId, status: 'Solved' });
    const practiceProgress = Math.min(100, Math.round((solvedQuestions / 10) * 100));

    // 7. Composite Preparation Readiness Indicator
    // Weighted formula:
    // 25% Resume Score + 25% Skill Coverage + 20% Learning Plan + 15% Mock Interview Avg + 15% Practice Lab
    const compositeScore = Math.round(
      resumeScore * 0.25 +
      skillCoverage * 0.25 +
      learningPlanProgress * 0.20 +
      averageInterviewScore * 0.15 +
      practiceProgress * 0.15
    );

    // 8. Dynamic Recommended Next Actions
    const recommendedActions = [];
    if (!latestResume) {
      recommendedActions.push({
        module: 'Resume Analyzer',
        title: 'Upload and audit your resume against target roles',
        path: '/resume-analyzer',
        priority: 'High',
      });
    } else if (resumeScore < 70) {
      recommendedActions.push({
        module: 'Resume Analyzer',
        title: 'Incorporate missing skills and quantifiable bullet points in your resume',
        path: '/resume-analyzer',
        priority: 'High',
      });
    }

    if (totalSkills < 4) {
      recommendedActions.push({
        module: 'Skill Gap Analyzer',
        title: 'Add your engineering proficiencies to the Skill Gap inventory',
        path: '/skill-gap',
        priority: 'High',
      });
    }

    if (interviewCount === 0) {
      recommendedActions.push({
        module: 'Interview Coach',
        title: 'Conduct your first simulated technical or behavioral mock interview',
        path: '/interview-coach',
        priority: 'Medium',
      });
    }

    if (solvedQuestions < 3) {
      recommendedActions.push({
        module: 'Practice Lab',
        title: 'Solve core CS fundamentals and system design questions in Practice Lab',
        path: '/practice-lab',
        priority: 'Medium',
      });
    }

    if (upcomingApps.length > 0) {
      recommendedActions.push({
        module: 'Placement Rescue',
        title: `Activate Placement Rescue Mode for upcoming interview at ${upcomingApps[0].company}`,
        path: '/placement-rescue',
        priority: 'Urgent',
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        compositeScore,
        metrics: {
          resumeScore,
          resumeCount,
          latestResumeRole: latestResume?.targetRole || null,
          totalSkills,
          proficientSkills,
          learningSkills,
          skillCoverage,
          learningPlanProgress,
          hasActivePlan: !!latestPlan,
          interviewCount,
          averageInterviewScore,
          solvedQuestions,
          practiceProgress,
          totalApplications: applications.length,
          upcomingInterviewsCount: upcomingApps.length,
          nextInterview: upcomingApps[0] || null,
        },
        weights: {
          resume: '25%',
          skillCoverage: '25%',
          learningRoadmap: '20%',
          mockInterviews: '15%',
          practiceLab: '15%',
        },
        disclaimer: 'Composite readiness measures tangible preparation progress across modules. It is not an objective predictor of job offer outcomes.',
        recommendedActions,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCareerReadiness,
};
