const express = require('express');
const router = express.Router();
const {
  getWatchlist,
  addToWatchlist,
  removeFromWatchlist,
} = require('../controllers/watchlistController');
const { authenticateToken } = require('../middleware/auth');
const { addWatchlistSchema, validate } = require('../validators/profileValidators');

router.use(authenticateToken);

router.get('/', getWatchlist);
router.post('/', validate(addWatchlistSchema), addToWatchlist);
router.delete('/:movieId', removeFromWatchlist);

module.exports = router;
