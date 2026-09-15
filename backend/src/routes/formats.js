const express = require('express');
const router = express.Router();
const {
  getCinemaScreens,
  getScreensByCinemaId,
  reportCinemaScreen,
} = require('../controllers/formatController');
const { authenticateToken } = require('../middleware/auth');

// Public endpoints to query verified cinema format specifications
router.get('/screens', getCinemaScreens);
router.get('/cinema/:cinemaId', getScreensByCinemaId);

// Protected endpoint to report/verify a format
router.post('/report', authenticateToken, reportCinemaScreen);

module.exports = router;
