const express = require('express');
const router = express.Router();
const {
  createPlan,
  getPlans,
  toggleTaskCompletion,
  deletePlan,
} = require('../controllers/learningPlanController');
const { authenticate } = require('../middleware/authMiddleware');

router.use(authenticate);

router.post('/generate', createPlan);
router.get('/', getPlans);
router.patch('/:planId/tasks/:taskId', toggleTaskCompletion);
router.delete('/:id', deletePlan);

module.exports = router;
