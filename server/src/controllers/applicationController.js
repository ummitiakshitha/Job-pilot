const mongoose = require('mongoose');
const JobApplication = require('../models/JobApplication');
const { STATUS_VALUES } = require('../models/JobApplication');

// Default initial checklist tasks for newly created applications
const getDefaultChecklist = () => [
  { id: 'task-1', text: 'Research company background and core product offerings', completed: false, createdAt: new Date() },
  { id: 'task-2', text: 'Review job description requirements and align portfolio projects', completed: false, createdAt: new Date() },
  { id: 'task-3', text: 'Revise core Data Structures, Algorithms & system concepts', completed: false, createdAt: new Date() },
  { id: 'task-4', text: 'Prepare STAR stories for behavioral and teamwork questions', completed: false, createdAt: new Date() },
  { id: 'task-5', text: 'Prepare 3 thoughtful questions to ask the interviewer', completed: false, createdAt: new Date() },
];

// Helper to validate application input
const validateApplicationInput = (data, isPatch = false) => {
  const errors = {};

  if (!isPatch || data.company !== undefined) {
    if (!data.company || !data.company.trim()) {
      errors.company = 'Company name is required';
    }
  }

  if (!isPatch || data.role !== undefined) {
    if (!data.role || !data.role.trim()) {
      errors.role = 'Job role is required';
    }
  }

  if (!isPatch || data.applicationDate !== undefined) {
    if (!data.applicationDate) {
      errors.applicationDate = 'Application date is required';
    } else {
      const parsedDate = new Date(data.applicationDate);
      if (isNaN(parsedDate.getTime())) {
        errors.applicationDate = 'Please provide a valid application date';
      }
    }
  }

  if (data.status !== undefined) {
    if (!STATUS_VALUES.includes(data.status)) {
      errors.status = `Status must be one of: ${STATUS_VALUES.join(', ')}`;
    }
  }

  if (data.jobLink && data.jobLink.trim()) {
    try {
      new URL(data.jobLink.trim());
    } catch (_) {
      errors.jobLink = 'Job link must be a valid URL (e.g. https://company.com/job)';
    }
  }

  if (data.salaryExpectation !== undefined && data.salaryExpectation !== null && data.salaryExpectation !== '') {
    const num = Number(data.salaryExpectation);
    if (isNaN(num) || num < 0) {
      errors.salaryExpectation = 'Salary expectation must be a non-negative number';
    }
  }

  if (data.offeredSalary !== undefined && data.offeredSalary !== null && data.offeredSalary !== '') {
    const num = Number(data.offeredSalary);
    if (isNaN(num) || num < 0) {
      errors.offeredSalary = 'Offered salary must be a non-negative number';
    }
  }

  if (data.interviewDate) {
    const parsedInterview = new Date(data.interviewDate);
    if (isNaN(parsedInterview.getTime())) {
      errors.interviewDate = 'Please provide a valid interview date';
    }
  }

  if (data.followUpDate) {
    const parsedFollowUp = new Date(data.followUpDate);
    if (isNaN(parsedFollowUp.getTime())) {
      errors.followUpDate = 'Please provide a valid follow-up date';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

// @desc    Get all job applications for authenticated user (with search, filter, sort, pagination)
// @route   GET /api/applications
// @access  Private
const getApplications = async (req, res, next) => {
  try {
    const {
      search,
      status,
      favoritesOnly,
      startDate,
      endDate,
      sortBy = 'applicationDate',
      order = 'desc',
      page = 1,
      limit = 100,
    } = req.query;

    const query = { userId: req.user._id };

    // Status filter
    if (status && STATUS_VALUES.includes(status)) {
      query.status = status;
    }

    // Favorites filter
    if (favoritesOnly === 'true' || favoritesOnly === true) {
      query.isFavorite = true;
    }

    // Date range filter
    if (startDate || endDate) {
      query.applicationDate = {};
      if (startDate) query.applicationDate.$gte = new Date(startDate);
      if (endDate) query.applicationDate.$lte = new Date(endDate);
    }

    // Search filter across company and role
    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [{ company: searchRegex }, { role: searchRegex }];
    }

    // Sort order
    const sortField = ['applicationDate', 'company', 'role', 'salaryExpectation', 'createdAt', 'status'].includes(sortBy)
      ? sortBy
      : 'applicationDate';
    const sortDirection = order.toLowerCase() === 'asc' ? 1 : -1;
    const sortOptions = { [sortField]: sortDirection };

    // Pagination
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 100));
    const skip = (pageNum - 1) * limitNum;

    const [applications, total] = await Promise.all([
      JobApplication.find(query).sort(sortOptions).skip(skip).limit(limitNum),
      JobApplication.countDocuments(query),
    ]);

    return res.status(200).json({
      success: true,
      message: 'Applications retrieved successfully',
      data: applications,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum) || 1,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single application by ID
// @route   GET /api/applications/:id
// @access  Private
const getApplicationById = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid application ID format',
      });
    }

    const application = await JobApplication.findOne({
      _id: id,
      userId: req.user._id,
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Job application not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Application retrieved successfully',
      data: application,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new job application
// @route   POST /api/applications
// @access  Private
const createApplication = async (req, res, next) => {
  try {
    const validation = validateApplicationInput(req.body);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validation.errors,
      });
    }

    const {
      company,
      role,
      jobLink,
      salaryExpectation,
      offeredSalary,
      applicationDate,
      status,
      interviewDate,
      followUpDate,
      isFavorite,
      notes,
      checklist,
    } = req.body;

    const initialChecklist =
      Array.isArray(checklist) && checklist.length > 0 ? checklist : getDefaultChecklist();

    const newApplication = await JobApplication.create({
      userId: req.user._id,
      company: company.trim(),
      role: role.trim(),
      jobLink: jobLink ? jobLink.trim() : '',
      salaryExpectation:
        salaryExpectation !== undefined && salaryExpectation !== null && salaryExpectation !== ''
          ? Number(salaryExpectation)
          : null,
      offeredSalary:
        offeredSalary !== undefined && offeredSalary !== null && offeredSalary !== ''
          ? Number(offeredSalary)
          : null,
      applicationDate: applicationDate ? new Date(applicationDate) : new Date(),
      status: status || 'Applied',
      interviewDate: interviewDate ? new Date(interviewDate) : null,
      followUpDate: followUpDate ? new Date(followUpDate) : null,
      followUpCompleted: false,
      isFavorite: Boolean(isFavorite),
      notes: notes ? notes.trim() : '',
      checklist: initialChecklist,
      activityHistory: [
        {
          action: 'Created',
          description: `Application logged for ${role.trim()} at ${company.trim()}`,
          timestamp: new Date(),
        },
      ],
    });

    return res.status(201).json({
      success: true,
      message: 'Application created successfully',
      data: newApplication,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update entire application
// @route   PUT /api/applications/:id
// @access  Private
const updateApplication = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid application ID format',
      });
    }

    const validation = validateApplicationInput(req.body);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validation.errors,
      });
    }

    const {
      company,
      role,
      jobLink,
      salaryExpectation,
      offeredSalary,
      applicationDate,
      status,
      interviewDate,
      followUpDate,
      followUpCompleted,
      isFavorite,
      notes,
      checklist,
    } = req.body;

    const application = await JobApplication.findOne({
      _id: id,
      userId: req.user._id,
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Job application not found',
      });
    }

    // Activity tracking for changes
    if (status && status !== application.status) {
      application.activityHistory.push({
        action: 'Status Changed',
        description: `Status advanced from ${application.status} to ${status}`,
        timestamp: new Date(),
      });
    }

    if (interviewDate && String(interviewDate) !== String(application.interviewDate)) {
      application.activityHistory.push({
        action: 'Interview Scheduled',
        description: `Interview set for ${new Date(interviewDate).toLocaleDateString('en-US')}`,
        timestamp: new Date(),
      });
    }

    application.company = company.trim();
    application.role = role.trim();
    application.jobLink = jobLink ? jobLink.trim() : '';
    application.salaryExpectation =
      salaryExpectation !== undefined && salaryExpectation !== null && salaryExpectation !== ''
        ? Number(salaryExpectation)
        : null;
    if (offeredSalary !== undefined) {
      application.offeredSalary =
        offeredSalary !== null && offeredSalary !== '' ? Number(offeredSalary) : null;
    }
    application.applicationDate = applicationDate ? new Date(applicationDate) : application.applicationDate;
    application.status = status || application.status;
    application.interviewDate = interviewDate ? new Date(interviewDate) : null;
    if (followUpDate !== undefined) {
      application.followUpDate = followUpDate ? new Date(followUpDate) : null;
    }
    if (followUpCompleted !== undefined) {
      application.followUpCompleted = Boolean(followUpCompleted);
    }
    if (isFavorite !== undefined) {
      application.isFavorite = Boolean(isFavorite);
    }
    application.notes = notes !== undefined ? notes.trim() : application.notes;
    if (Array.isArray(checklist)) {
      application.checklist = checklist;
    }

    const updatedApplication = await application.save();

    return res.status(200).json({
      success: true,
      message: 'Application updated successfully',
      data: updatedApplication,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update only application status
// @route   PATCH /api/applications/:id/status
// @access  Private
const updateStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid application ID format',
      });
    }

    if (!status || !STATUS_VALUES.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: {
          status: `Status must be one of: ${STATUS_VALUES.join(', ')}`,
        },
      });
    }

    const application = await JobApplication.findOne({
      _id: id,
      userId: req.user._id,
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Job application not found',
      });
    }

    const oldStatus = application.status;
    application.status = status;
    application.activityHistory.push({
      action: 'Status Changed',
      description: `Stage shifted from ${oldStatus} to ${status}`,
      timestamp: new Date(),
    });

    const updatedApplication = await application.save();

    return res.status(200).json({
      success: true,
      message: 'Application status updated successfully',
      data: updatedApplication,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle checklist item completion
// @route   PATCH /api/applications/:id/checklist/:taskId
// @access  Private
const toggleChecklistTask = async (req, res, next) => {
  try {
    const { id, taskId } = req.params;
    const { completed } = req.body;

    const application = await JobApplication.findOne({
      _id: id,
      userId: req.user._id,
    });

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    const task = application.checklist.find((t) => t.id === taskId);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Checklist task not found' });
    }

    task.completed = completed !== undefined ? Boolean(completed) : !task.completed;
    application.activityHistory.push({
      action: 'Checklist Updated',
      description: `Task "${task.text}" marked as ${task.completed ? 'complete' : 'pending'}`,
      timestamp: new Date(),
    });

    await application.save();

    return res.status(200).json({
      success: true,
      message: 'Checklist task updated',
      data: application,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add new custom task to checklist
// @route   POST /api/applications/:id/checklist
// @access  Private
const addChecklistTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ success: false, message: 'Task text is required' });
    }

    const application = await JobApplication.findOne({
      _id: id,
      userId: req.user._id,
    });

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    const newTask = {
      id: 'task-' + Date.now(),
      text: text.trim(),
      completed: false,
      createdAt: new Date(),
    };

    application.checklist.push(newTask);
    application.activityHistory.push({
      action: 'Checklist Added',
      description: `Added task: "${text.trim()}"`,
      timestamp: new Date(),
    });

    await application.save();

    return res.status(201).json({
      success: true,
      message: 'Checklist task added',
      data: application,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete task from checklist
// @route   DELETE /api/applications/:id/checklist/:taskId
// @access  Private
const deleteChecklistTask = async (req, res, next) => {
  try {
    const { id, taskId } = req.params;

    const application = await JobApplication.findOne({
      _id: id,
      userId: req.user._id,
    });

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    application.checklist = application.checklist.filter((t) => t.id !== taskId);
    await application.save();

    return res.status(200).json({
      success: true,
      message: 'Checklist task deleted',
      data: application,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update follow-up date and completion state
// @route   PATCH /api/applications/:id/follow-up
// @access  Private
const updateFollowUp = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { followUpDate, followUpCompleted } = req.body;

    const application = await JobApplication.findOne({
      _id: id,
      userId: req.user._id,
    });

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    if (followUpDate !== undefined) {
      application.followUpDate = followUpDate ? new Date(followUpDate) : null;
    }
    if (followUpCompleted !== undefined) {
      application.followUpCompleted = Boolean(followUpCompleted);
      if (application.followUpCompleted) {
        application.activityHistory.push({
          action: 'Follow-Up Completed',
          description: `Follow-up action marked complete`,
          timestamp: new Date(),
        });
      }
    }

    await application.save();

    return res.status(200).json({
      success: true,
      message: 'Follow-up status updated',
      data: application,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle application favorite / bookmark
// @route   PATCH /api/applications/:id/favorite
// @access  Private
const toggleFavorite = async (req, res, next) => {
  try {
    const { id } = req.params;

    const application = await JobApplication.findOne({
      _id: id,
      userId: req.user._id,
    });

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    application.isFavorite = !application.isFavorite;
    await application.save();

    return res.status(200).json({
      success: true,
      message: application.isFavorite ? 'Application added to favorites' : 'Application removed from favorites',
      data: application,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete application
// @route   DELETE /api/applications/:id
// @access  Private
const deleteApplication = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid application ID format',
      });
    }

    const deleted = await JobApplication.findOneAndDelete({
      _id: id,
      userId: req.user._id,
    });

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Job application not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Application deleted successfully',
      data: {
        _id: id,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get aggregate statistics for authenticated user's job applications
// @route   GET /api/applications/stats
// @access  Private
const getStats = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Aggregation for counts by status
    const statusCounts = await JobApplication.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    // Format counts
    const countsMap = {
      Applied: 0,
      Interview: 0,
      Offer: 0,
      Rejected: 0,
    };

    let total = 0;
    statusCounts.forEach((item) => {
      if (countsMap[item._id] !== undefined) {
        countsMap[item._id] = item.count;
      }
      total += item.count;
    });

    // Form status distribution array
    const statusDistribution = [
      { status: 'Applied', count: countsMap.Applied, color: '#38BDF8' },
      { status: 'Interview', count: countsMap.Interview, color: '#A855F7' },
      { status: 'Offer', count: countsMap.Offer, color: '#10B981' },
      { status: 'Rejected', count: countsMap.Rejected, color: '#F43F5E' },
    ];

    // Aggregation for monthly timeline
    const monthlyData = await JobApplication.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: {
            year: { $year: '$applicationDate' },
            month: { $month: '$applicationDate' },
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: {
          '_id.year': 1,
          '_id.month': 1,
        },
      },
    ]);

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyTrends = monthlyData.map((item) => ({
      month: `${monthNames[item._id.month - 1]} ${item._id.year}`,
      count: item.count,
    }));

    // Find upcoming interviews (where interviewDate is in future or today)
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    const upcomingInterviews = await JobApplication.find({
      userId,
      interviewDate: { $gte: startOfToday },
    })
      .sort({ interviewDate: 1 })
      .limit(6);

    // Follow-ups calculations
    const [followUpsDueToday, overdueFollowUps, pendingFollowUps, favoriteCount] = await Promise.all([
      JobApplication.countDocuments({
        userId,
        followUpCompleted: false,
        followUpDate: { $gte: startOfToday, $lte: endOfToday },
      }),
      JobApplication.countDocuments({
        userId,
        followUpCompleted: false,
        followUpDate: { $lt: startOfToday },
      }),
      JobApplication.find({
        userId,
        followUpCompleted: false,
        followUpDate: { $ne: null },
      })
        .sort({ followUpDate: 1 })
        .limit(5),
      JobApplication.countDocuments({
        userId,
        isFavorite: true,
      }),
    ]);

    // Recent 5 applications
    const recentApplications = await JobApplication.find({ userId })
      .sort({ createdAt: -1 })
      .limit(5);

    // Conversion rate metrics
    // Interview rate = applications that reached interview stage divided by total applications * 100
    // Offer rate = applications in offer stage divided by total applications * 100
    const interviewRate = total > 0 ? Math.round((countsMap.Interview / total) * 100) : 0;
    const offerRate = total > 0 ? Math.round((countsMap.Offer / total) * 100) : 0;

    return res.status(200).json({
      success: true,
      message: 'Dashboard statistics calculated successfully',
      data: {
        total,
        applied: countsMap.Applied,
        interview: countsMap.Interview,
        offer: countsMap.Offer,
        rejected: countsMap.Rejected,
        statusDistribution,
        monthlyTrends,
        upcomingInterviews,
        recentApplications,
        followUpsDueToday,
        overdueFollowUps,
        pendingFollowUps,
        favoriteCount,
        metrics: {
          interviewRate,
          offerRate,
        },
        definitions: {
          interviewRate: 'Applications reaching Interview stage / Total applications * 100',
          offerRate: 'Applications in Offer stage / Total applications * 100',
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getApplications,
  getApplicationById,
  createApplication,
  updateApplication,
  updateStatus,
  toggleChecklistTask,
  addChecklistTask,
  deleteChecklistTask,
  updateFollowUp,
  toggleFavorite,
  deleteApplication,
  getStats,
};
