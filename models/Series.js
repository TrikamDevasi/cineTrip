import mongoose from "mongoose";

const SeriesSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  tmdbId: {
    type: Number,
    required: true,
  },
  contentType: {
    type: String,
    default: "series",
  },
  title: {
    type: String,
    required: true,
  },
  originalTitle: String,
  overview: String,
  posterPath: String,
  backdropPath: String,
  genres: [String],
  firstAirDate: String,
  status: String, // "Returning Series", "Ended", etc. (from TMDb)
  totalSeasons: Number,
  totalEpisodes: Number,
  watchStatus: {
    type: String,
    enum: ["to_watch", "watching", "completed", "on_hold", "dropped"],
    default: "to_watch",
  },
  currentSeason: { type: Number, default: 1 },
  currentEpisode: { type: Number, default: 0 },
  userRating: { type: Number, min: 0, max: 10 },
  userNotes: String,
  isFavorite: { type: Boolean, default: false },
  addedAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Update the updatedAt field on save
SeriesSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.models.Series || mongoose.model("Series", SeriesSchema);
