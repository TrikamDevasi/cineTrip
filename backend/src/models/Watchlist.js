const mongoose = require('mongoose');

const watchlistSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    movieId: {
      type: Number,
      required: true,
    },
    movieData: {
      id: { type: Number },
      title: { type: String },
      original_title: { type: String },
      overview: { type: String },
      poster_path: { type: String },
      backdrop_path: { type: String },
      vote_average: { type: Number },
      vote_count: { type: Number },
      release_date: { type: String },
      runtime: { type: Number },
      genres: [{ id: Number, name: String }],
      formats: [{ type: String }],
      tagline: { type: String },
    },
    preferredFormat: { type: String, default: 'IMAX Laser' },
    addedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Compound unique index: one movie per user
watchlistSchema.index({ user: 1, movieId: 1 }, { unique: true });

module.exports = mongoose.model('Watchlist', watchlistSchema);
