const express = require('express');
const router = express.Router();
const {
  getSkills,
  addSkill,
  updateSkill,
  deleteSkill,
  analyzeSkillGap,
} = require('../controllers/skillController');
const { authenticate } = require('../middleware/authMiddleware');

router.use(authenticate);

router.get('/', getSkills);
router.post('/', addSkill);
router.post('/gap-analysis', analyzeSkillGap);
router.put('/:id', updateSkill);
router.delete('/:id', deleteSkill);

module.exports = router;
