import React from 'react';
  
  const ProfileValidators = () =>  {
	return (
	  <div>
	  </div>
	);
  }
  
  export default ProfileValidators;
  const { z } = require('zod');

const updateProfileSchema = z.object({
  name: z.string().min(2).max(100).trim().optional(),
  profile: z
    .object({
      city: z.string().max(100).optional(),
      avatar: z.string().max(10).optional(),
      preferredFormat: z.string().max(100).optional(),
      preferredChain: z.string().max(100).optional(),
      favoriteGenres: z.array(z.string()).optional(),
      notificationsEnabled: z.boolean().optional(),
      autoExportCalendar: z.boolean().optional(),
      themeMode: z.enum(['dark', 'light', 'system']).optional(),
    })
    .optional(),
});

const addWatchlistSchema = z.object({
  movieId: z.number({ required_error: 'Movie ID is required' }),
  movieData: z.object({
    id: z.number().optional(),
    title: z.string().min(1),
    poster_path: z.string().optional(),
    backdrop_path: z.string().optional(),
    vote_average: z.number().optional(),
    release_date: z.string().optional(),
    genres: z.array(z.object({ id: z.number().optional(), name: z.string() })).optional(),
    formats: z.array(z.string()).optional(),
    tagline: z.string().optional(),
    overview: z.string().optional(),
  }),
  preferredFormat: z.string().optional(),
});

const validate = (schema) => (req, res, next) => {
  try {
    req.body = schema.parse(req.body);
    next();
  } catch (err) {
    if (err.errors) {
      const messages = err.errors.map((e) => e.message).join('. ');
      return res.status(400).json({ message: messages, errors: err.errors });
    }
    next(err);
  }
};

module.exports = { updateProfileSchema, addWatchlistSchema, validate };
