const express = require('express');
const router = express.Router();
const authRoutes = require('./authRoutes');
const scoreRoutes = require('./scoreRoutes');

// API routes
router.use('/auth', authRoutes);
router.use('/score', scoreRoutes);

router.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

module.exports = router; 