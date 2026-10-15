const mongoose = require('mongoose');
const JobApplication = require('../models/JobApplication');
const { STATUS_VALUES } = require('../models/JobApplication');

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

  if (data.interviewDate) {
    const parsedInterview = new Date(data.interviewDate);
    if (isNaN(parsedInterview.getTime())) {
      errors.interviewDate = 'Please provide a valid interview date';
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
      applicationDate,
      status,
      interviewDate,
      notes,
    } = req.body;

    const newApplication = await JobApplication.create({
      userId: req.user._id,
      company: company.trim(),
      role: role.trim(),
      jobLink: jobLink ? jobLink.trim() : '',
      salaryExpectation:
        salaryExpectation !== undefined && salaryExpectation !== null && salaryExpectation !== ''
          ? Number(salaryExpectation)
          : null,
      applicationDate: applicationDate ? new Date(applicationDate) : new Date(),
      status: status || 'Applied',
      interviewDate: interviewDate ? new Date(interviewDate) : null,
      notes: notes ? notes.trim() : '',
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
      applicationDate,
      status,
      interviewDate,
      notes,
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

    application.company = company.trim();
    application.role = role.trim();
    application.jobLink = jobLink ? jobLink.trim() : '';
    application.salaryExpectation =
      salaryExpectation !== undefined && salaryExpectation !== null && salaryExpectation !== ''
        ? Number(salaryExpectation)
        : null;
    application.applicationDate = applicationDate ? new Date(applicationDate) : application.applicationDate;
    application.status = status || application.status;
    application.interviewDate = interviewDate ? new Date(interviewDate) : null;
    application.notes = notes !== undefined ? notes.trim() : application.notes;

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

    application.status = status;
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

    // Aggregation for monthly timeline (last 6 months)
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

    // Find upcoming interviews (where interviewDate is in future or today, status is Interview)
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const upcomingInterviews = await JobApplication.find({
      userId,
      interviewDate: { $gte: startOfToday },
    })
      .sort({ interviewDate: 1 })
      .limit(5);

    // Recent 5 applications
    const recentApplications = await JobApplication.find({ userId })
      .sort({ createdAt: -1 })
      .limit(5);

    // Conversion rate metrics
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
        metrics: {
          interviewRate,
          offerRate,
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
  deleteApplication,
  getStats,
};
