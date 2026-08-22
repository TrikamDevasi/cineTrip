import mongoose from "mongoose";

const MemorySchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      default: "guest",
      index: true,
    },
    movie: {
      id: { type: Number, required: true },
      title: { type: String, required: true },
      poster_path: String,
      backdrop_path: String,
      release_date: String,
    },
    watchedDate: {
      type: Date,
      default: Date.now,
    },
    experienceType: {
      type: String,
      enum: ["theatrical", "home_theater", "outdoor", "watch_party"],
      default: "theatrical",
    },
    cinemaName: {
      type: String,
      default: "",
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: 5,
    },
    story: {
      type: String,
      default: "",
    },
    favoriteMoment: {
      type: String,
      default: "",
    },
    companions: [
      {
        name: String,
        avatar: String,
      },
    ],
    snackHighlight: {
      type: String, // e.g. "Caramel popcorn + Large ICEE"
      default: "",
    },
    photos: [
      {
        url: String,
        caption: String,
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.models.Memory || mongoose.model("Memory", MemorySchema);
