const CinemaScreen = require('../models/CinemaScreen');

/**
 * Premium Format Intelligence Controller
 *
 * Provides verified and user-reported theatre auditorium technical specs
 * (IMAX vs IMAX 70mm, Laser projection, sound systems, aspect ratios).
 */

// GET /api/formats/screens
const getCinemaScreens = async (req, res, next) => {
  try {
    const { cinemaId, city, format, projection, verifiedOnly } = req.query;
    const filter = {};

    if (cinemaId) filter.cinemaId = cinemaId;
    if (city) filter.city = new RegExp(city.trim(), 'i');
    if (format) filter.format = format;
    if (projection) filter.projection = projection;
    if (verifiedOnly === 'true') filter.verificationStatus = 'verified';

    const screens = await CinemaScreen.find(filter)
      .sort({ verificationStatus: 1, theatreName: 1 })
      .lean();

    res.json({
      data: screens,
      count: screens.length,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/formats/cinema/:cinemaId
const getScreensByCinemaId = async (req, res, next) => {
  try {
    const screens = await CinemaScreen.find({ cinemaId: req.params.cinemaId }).lean();
    res.json({ data: screens });
  } catch (error) {
    next(error);
  }
};

// POST /api/formats/report (Report or contribute a format finding)
const reportCinemaScreen = async (req, res, next) => {
  try {
    const {
      cinemaId,
      theatreName,
      screenName,
      format,
      projection,
      sound,
      aspectRatio,
      city,
    } = req.body;

    if (!cinemaId || !theatreName || !screenName) {
      return res.status(400).json({ message: 'Cinema ID, theatre name, and screen name are required.' });
    }

    const screen = new CinemaScreen({
      cinemaId,
      theatreName,
      screenName,
      format: format || 'Regular 2D',
      projection: projection || 'Unverified',
      sound: sound || 'Standard 5.1 / 7.1',
      aspectRatio: aspectRatio || 'Unknown',
      city: city || '',
      verificationStatus: 'user_reported',
      source: `User Report by ${req.user?.name || 'Cinephile'}`,
      lastVerifiedAt: new Date(),
      verifiedBy: req.user?._id || null,
    });

    await screen.save();
    res.status(201).json({ message: 'Format observation reported.', data: screen });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCinemaScreens,
  getScreensByCinemaId,
  reportCinemaScreen,
};
