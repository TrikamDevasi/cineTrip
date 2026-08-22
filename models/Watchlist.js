import mongoose from "mongoose";

const WatchlistSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true,
  },
  mediaId: {
    type: Number,
    required: true,
  },
  mediaType: {
    type: String,
    enum: ["movie", "tv"],
    default: "movie",
  },
  title: {
    type: String,
    required: true,
  },
  posterPath: String,
  backdropPath: String,
  voteAverage: Number,
  releaseDate: String,
  genres: [String],
  status: {
    type: String,
    enum: ["plan_to_watch", "watching", "completed"],
    default: "plan_to_watch",
  },
  addedAt: {
    type: Date,
    default: Date.now,
  },
});

WatchlistSchema.index({ userId: 1, mediaId: 1, mediaType: 1 }, { unique: true });

export default mongoose.models.Watchlist || mongoose.model("Watchlist", WatchlistSchema);
