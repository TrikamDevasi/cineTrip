const Watchlist = require('../models/Watchlist');

// GET /api/watchlist
const getWatchlist = async (req, res, next) => {
  try {
    const items = await Watchlist.find({ user: req.user._id })
      .sort({ addedAt: -1 })
      .lean();
    res.json({ data: items });
  } catch (error) {
    next(error);
  }
};

// POST /api/watchlist
const addToWatchlist = async (req, res, next) => {
  try {
    const { movieId, movieData, preferredFormat } = req.body;

    // Upsert: if already exists, update preferredFormat
    const item = await Watchlist.findOneAndUpdate(
      { user: req.user._id, movieId },
      { user: req.user._id, movieId, movieData, preferredFormat, addedAt: new Date() },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.status(201).json({ message: 'Added to watchlist.', data: item });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/watchlist/:movieId
const removeFromWatchlist = async (req, res, next) => {
  try {
    const movieId = parseInt(req.params.movieId);
    const item = await Watchlist.findOneAndDelete({ user: req.user._id, movieId });
    if (!item) {
      return res.status(404).json({ message: 'Movie not found in watchlist.' });
    }
    res.json({ message: 'Removed from watchlist.' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getWatchlist, addToWatchlist, removeFromWatchlist };
