const express = require('express');
const router = express.Router();
const { generateRescuePlan } = require('../controllers/placementRescueController');
const { authenticate } = require('../middleware/authMiddleware');

router.use(authenticate);

router.post('/plan', generateRescuePlan);

module.exports = router;
