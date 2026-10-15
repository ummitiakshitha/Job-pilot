const express = require('express');
const multer = require('multer');
const router = express.Router();
const {
  analyzeResume,
  getAnalyses,
  getAnalysisById,
  deleteAnalysis,
} = require('../controllers/resumeController');
const { authenticate } = require('../middleware/authMiddleware');

// Configure multer for memory storage and PDF validation
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf' || file.originalname.toLowerCase().endsWith('.pdf')) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF documents are allowed.'), false);
    }
  },
});

router.use(authenticate);

router.post('/analyze', upload.single('resume'), analyzeResume);
router.get('/analyses', getAnalyses);
router.get('/analyses/:id', getAnalysisById);
router.delete('/analyses/:id', deleteAnalysis);

module.exports = router;
