import mongoose from "mongoose";

const HistorySchema = new mongoose.Schema({
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
  watchedAt: {
    type: Date,
    default: Date.now,
  },
  progressSeconds: {
    type: Number,
    default: 0,
  },
  durationSeconds: {
    type: Number,
    default: 0,
  },
});

export default mongoose.models.History || mongoose.model("History", HistorySchema);
