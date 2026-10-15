const JobApplication = require('../models/JobApplication');
const UserSkill = require('../models/UserSkill');

/**
 * @desc    Generate high-intensity focused Placement Rescue plan for an upcoming interview
 * @route   POST /api/placement-rescue/plan
 * @access  Private
 */
const generateRescuePlan = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { applicationId } = req.body;

    let targetApp = null;
    if (applicationId) {
      targetApp = await JobApplication.findOne({ _id: applicationId, userId });
    } else {
      // Find the nearest upcoming interview
      targetApp = await JobApplication.findOne({
        userId,
        interviewDate: { $gte: new Date() },
      }).sort({ interviewDate: 1 });
    }

    if (!targetApp || !targetApp.interviewDate) {
      return res.status(200).json({
        success: true,
        data: {
          hasUpcomingInterview: false,
          message: 'No upcoming interview scheduled. Set an interview date on an application to activate Placement Rescue Mode.',
          schedule: [],
        },
      });
    }

    const now = new Date();
    const interviewDate = new Date(targetApp.interviewDate);
    const diffMs = interviewDate.getTime() - now.getTime();
    const daysRemaining = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));

    // Fetch user skills to identify gaps
    const userSkills = await UserSkill.find({ userId });
    const missingSkills = userSkills
      .filter((s) => s.status === 'Identified Gap' || s.status === 'Learning')
      .map((s) => s.name);

    // Build day-by-day schedule according to daysRemaining
    const planDays = Math.min(7, Math.max(2, daysRemaining));
    const dailySchedule = [];

    for (let day = 1; day <= planDays; day++) {
      if (day === 1) {
        dailySchedule.push({
          dayNumber: 1,
          theme: 'Company Intelligence & Architecture Fundamentals',
          focus: `Deep-dive ${targetApp.company} product suite and core ${targetApp.role} mechanics.`,
          estimatedHours: 2.5,
          tasks: [
            { text: `Research ${targetApp.company} recent engineering blog posts or architecture announcements.`, completed: false },
            { text: `Review fundamentals for ${missingSkills.slice(0, 2).join(' and ') || 'primary stack requirements'}.`, completed: false },
            { text: 'Audit your resume to ensure you can explain every single bullet point without hesitation.', completed: false },
          ],
        });
      } else if (day === planDays - 1) {
        dailySchedule.push({
          dayNumber: day,
          theme: 'Simulated Timed Mock Drills & STAR Stories',
          focus: 'High-pressure verbal articulation and behavioral alignment.',
          estimatedHours: 2.0,
          tasks: [
            { text: 'Run 1 full simulated mock interview round in JobPilot Interview Coach.', completed: false },
            { text: 'Polish 3 STAR stories addressing conflict resolution, system design hurdles, and leadership.', completed: false },
            { text: 'Prepare 4 strategic questions to ask the interviewer about team engineering culture.', completed: false },
          ],
        });
      } else if (day === planDays) {
        dailySchedule.push({
          dayNumber: day,
          theme: 'Final Calm Readiness & Execution Checklist',
          focus: 'Confidence building, environment sanity check, and mental clarity.',
          estimatedHours: 1.0,
          tasks: [
            { text: 'Perform audio/video check and verify quiet interview setup.', completed: false },
            { text: 'Re-read your 1-page quick technical cheat-sheet (no heavy cramming).', completed: false },
            { text: 'Review company mission statement and key interview panelists if known.', completed: false },
          ],
        });
      } else {
        dailySchedule.push({
          dayNumber: day,
          theme: `Core Technical Mastery (Day ${day})`,
          focus: 'Data structures, API design, and system trade-offs.',
          estimatedHours: 2.5,
          tasks: [
            { text: 'Solve 3 medium difficulty questions in JobPilot Practice Lab.', completed: false },
            { text: 'Practice explaining asynchronous code execution and database indexing aloud.', completed: false },
          ],
        });
      }
    }

    return res.status(200).json({
      success: true,
      data: {
        hasUpcomingInterview: true,
        application: {
          id: targetApp._id,
          company: targetApp.company,
          role: targetApp.role,
          interviewDate: targetApp.interviewDate,
          daysRemaining,
        },
        dailySchedule,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  generateRescuePlan,
};
