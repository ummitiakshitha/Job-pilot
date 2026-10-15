const express = require('express');
const router = express.Router();
const {
  getQuestions,
  recordAttempt,
  getPracticeStats,
} = require('../controllers/practiceController');
const { authenticate } = require('../middleware/authMiddleware');

router.use(authenticate);

router.get('/questions', getQuestions);
router.post('/attempt', recordAttempt);
router.get('/stats', getPracticeStats);

module.exports = router;
