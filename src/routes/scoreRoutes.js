const express = require('express');
const router = express.Router();
const { saveScore, getScoreCard, getWeeklyScores } = require('../controllers/scoreController');
const { authenticate } = require('../middlewares/auth');
const { saveScoreValidator } = require('../middlewares/validators');


router.post('/save', authenticate, saveScoreValidator, saveScore);
router.get('/scorecard', authenticate, getScoreCard);
router.get('/weekly', authenticate, getWeeklyScores);

module.exports = router; 