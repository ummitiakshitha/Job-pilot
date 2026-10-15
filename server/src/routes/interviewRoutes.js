const express = require('express');
const router = express.Router();
const {
  startInterview,
  submitAnswer,
  completeInterview,
  getInterviews,
  getInterviewById,
} = require('../controllers/interviewController');
const { authenticate } = require('../middleware/authMiddleware');

router.use(authenticate);

router.post('/start', startInterview);
router.post('/:sessionId/answer', submitAnswer);
router.post('/:sessionId/complete', completeInterview);
router.get('/', getInterviews);
router.get('/:sessionId', getInterviewById);

module.exports = router;
