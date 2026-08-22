import mongoose from "mongoose";

const ReviewSchema = new mongoose.Schema({
  mediaId: {
    type: Number,
    required: true,
    index: true,
  },
  mediaType: {
    type: String,
    enum: ["movie", "tv"],
    default: "movie",
  },
  userId: {
    type: String,
    required: true,
  },
  userName: {
    type: String,
    required: true,
  },
  userAvatar: String,
  rating: {
    type: Number,
    min: 1,
    max: 10,
    required: true,
  },
  content: {
    type: String,
    required: true,
    maxlength: 2000,
  },
  spoilers: {
    type: Boolean,
    default: false,
  },
  likes: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Review || mongoose.model("Review", ReviewSchema);
