import mongoose from "mongoose";

const TripPlanSchema = new mongoose.Schema(
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
      runtime: Number,
      genres: [String],
      vote_average: Number,
      overview: String,
    },
    cinema: {
      name: { type: String, required: true },
      brand: { type: String, default: "IMAX" }, // PVR, INOX, AMC, Regal, Cinemark, IMAX, Dolby
      screenType: { type: String, default: "IMAX with Laser" },
      address: { type: String, default: "" },
      city: { type: String, default: "" },
    },
    date: {
      type: String, // YYYY-MM-DD
      required: true,
    },
    time: {
      type: String, // HH:MM or 07:30 PM
      required: true,
    },
    slotName: {
      type: String, // "Evening Show", "Matinee", "Late Night"
      default: "Evening Show",
    },
    friends: [
      {
        name: { type: String, required: true },
        avatar: String,
        status: {
          type: String,
          enum: ["invited", "accepted", "declined"],
          default: "invited",
        },
      },
    ],
    notes: {
      type: String,
      default: "",
    },
    seats: {
      type: String, // e.g. "Row F, Seats 12-14"
      default: "",
    },
    status: {
      type: String,
      enum: ["upcoming", "completed", "cancelled"],
      default: "upcoming",
      index: true,
    },
    bookingRef: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

export default mongoose.models.TripPlan || mongoose.model("TripPlan", TripPlanSchema);
