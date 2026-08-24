import React from 'react';
  
  const Memory = () =>  {
	return (
	  <div>
	  </div>
	);
  }
  
  export default Memory;
  const mongoose = require('mongoose');

const memorySchema = new mongoose.Schema(
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
      release_date: { type: String },
    },
    watchedDate: { type: String, required: true },
    experienceType: { type: String, default: 'Standard' },
    cinemaName: { type: String, default: '' },
    rating: { type: Number, min: 1, max: 5, default: 5 },
    story: { type: String, default: '' },
    favoriteMoment: { type: String, default: '' },
    companions: [
      {
        name: { type: String },
        avatar: { type: String, default: '🍿' },
      },
    ],
    snackHighlight: { type: String, default: '' },
    photoUri: { type: String, default: '' },
    videoUri: { type: String, default: '' },
    location: {
      latitude: { type: Number },
      longitude: { type: Number },
      address: { type: String },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Memory', memorySchema);
