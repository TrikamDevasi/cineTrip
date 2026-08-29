const mongoose = require('mongoose');

const planSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    movie: {
      id: { type: Number },
      title: { type: String, required: true },
      poster_path: { type: String },
      backdrop_path: { type: String },
      runtime: { type: Number },
      vote_average: { type: Number },
      genres: [{ id: Number, name: String }],
    },
    cinema: {
      id: { type: String },
      name: { type: String },
      brand: { type: String },
      screenType: { type: String },
      address: { type: String },
      city: { type: String },
      distanceKm: { type: Number },
    },
    date: { type: String, required: true },
    time: { type: String, default: '' },
    slotName: { type: String, default: '' },
    showtime: {
      id: { type: String },
      time: { type: String },
      label: { type: String },
      cinemaId: { type: String },
    },
    showtimeId: { type: String, default: '' },
    bookingStatus: {
      type: String,
      enum: ['plan', 'pending', 'confirmed', 'cancelled'],
      default: 'plan',
    },
    ticketingConnected: { type: Boolean, default: false },
    friends: [
      {
        id: { type: String },
        name: { type: String },
        avatar: { type: String },
        handle: { type: String },
        status: {
          type: String,
          enum: ['accepted', 'invited', 'declined'],
          default: 'invited',
        },
      },
    ],
    notes: { type: String, default: '' },
    seats: { type: String, default: '' },
    bookingRef: { type: String, default: '' },
    snacks: [{ type: String }],
    status: {
      type: String,
      enum: ['upcoming', 'completed', 'cancelled'],
      default: 'upcoming',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Plan', planSchema);
