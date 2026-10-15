const express = require('express');
const router = express.Router();
const {
  decodeJD,
  getJobDescriptions,
  getJobDescriptionById,
  deleteJobDescription,
} = require('../controllers/jobDescriptionController');
const { authenticate } = require('../middleware/authMiddleware');

router.use(authenticate);

router.post('/decode', decodeJD);
router.get('/', getJobDescriptions);
router.get('/:id', getJobDescriptionById);
router.delete('/:id', deleteJobDescription);

module.exports = router;
