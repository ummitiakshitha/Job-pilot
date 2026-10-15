const express = require('express');
const router = express.Router();
const { getCareerReadiness } = require('../controllers/careerReadinessController');
const { authenticate } = require('../middleware/authMiddleware');

router.use(authenticate);

router.get('/', getCareerReadiness);

module.exports = router;
