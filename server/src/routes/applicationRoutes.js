const express = require('express');
const router = express.Router();
const {
  getApplications,
  getApplicationById,
  createApplication,
  updateApplication,
  updateStatus,
  deleteApplication,
  getStats,
} = require('../controllers/applicationController');
const { authenticate } = require('../middleware/authMiddleware');

// All application routes are strictly protected
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

module.exports = router;
