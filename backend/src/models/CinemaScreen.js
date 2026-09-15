const mongoose = require('mongoose');

/**
 * CinemaScreen Schema
 *
 * Represents an auditorium/screen and its verified theatrical technology specs.
 * Specifically treats "IMAX" and "IMAX 70mm" as separate projection properties
 * and tracks verification status and sources honestly without fabricating certifications.
 */
const cinemaScreenSchema = new mongoose.Schema(
  {
    cinemaId: {
      type: String,
      required: true,
      index: true,
    },
    theatreName: {
      type: String,
      required: true,
      trim: true,
    },
    screenName: {
      type: String,
      required: true,
      trim: true,
    },
    format: {
      type: String,
      required: true,
      enum: [
        'IMAX',
        'IMAX with Laser',
        'IMAX 70mm',
        'Dolby Cinema',
        'Dolby Atmos',
        '4DX',
        'ScreenX',
        'MX4D',
        'Regular 2D',
        'RealD 3D',
      ],
      default: 'Regular 2D',
    },
    projection: {
      type: String,
      required: true,
      enum: [
        '15-perf 70mm Film',
        'Dual 4K Laser (GT)',
        'Single Commercial Laser (CoLa)',
        'Xenon Digital',
        'Dolby Vision Dual Christie 4K Laser',
        'Barco 4K Laser',
        'Standard Xenon Digital 2K',
        '35mm Film',
        'Unverified',
      ],
      default: 'Unverified',
    },
    sound: {
      type: String,
      default: 'Standard 5.1 / 7.1',
    },
    aspectRatio: {
      type: String,
      enum: ['1.43:1', '1.90:1', '2.39:1', 'Unknown'],
      default: 'Unknown',
    },
    seatCapacity: {
      type: Number,
      default: null,
    },
    verificationStatus: {
      type: String,
      enum: ['verified', 'user_reported', 'unverified'],
      default: 'unverified',
      index: true,
    },
    source: {
      type: String,
      default: 'Community Inspection',
    },
    lastVerifiedAt: {
      type: Date,
      default: null,
    },
    verifiedBy: {
      type: String,
      default: null,
    },
    city: {
      type: String,
      default: '',
      index: true,
    },
    coordinates: {
      latitude: { type: Number },
      longitude: { type: Number },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('CinemaScreen', cinemaScreenSchema);
