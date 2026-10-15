const express = require('express');
const router = express.Router();
const {
  createSTARAnswer,
  getSTARAnswers,
  updateSTARAnswer,
  deleteSTARAnswer,
} = require('../controllers/starAnswerController');
const { authenticate } = require('../middleware/authMiddleware');

router.use(authenticate);

router.post('/', createSTARAnswer);
router.get('/', getSTARAnswers);
router.put('/:id', updateSTARAnswer);
router.delete('/:id', deleteSTARAnswer);

module.exports = router;
