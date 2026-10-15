const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/applicationController');
const { authenticate } = require('../middleware/authMiddleware');

// All application routes are strictly protected with JWT authentication
router.use(authenticate);

// Aggregated stats route (must come before /:id)
router.get('/stats', getStats);

// Collection routes
router.get('/', getApplications);
router.post('/', createApplication);

// Document specific routes
router.get('/:id', getApplicationById);
router.put('/:id', updateApplication);
router.patch('/:id/status', updateStatus);
router.delete('/:id', deleteApplication);

// Feature 4: Interview Preparation Checklist routes
router.post('/:id/checklist', addChecklistTask);
router.patch('/:id/checklist/:taskId', toggleChecklistTask);
router.delete('/:id/checklist/:taskId', deleteChecklistTask);

// Feature 5: Follow-Up Reminders route
router.patch('/:id/follow-up', updateFollowUp);

// Feature 9: Favorite / Bookmark route
router.patch('/:id/favorite', toggleFavorite);

module.exports = router;
