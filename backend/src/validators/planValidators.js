import React from 'react';
  
  const PlanValidators = () =>  {
	return (
	  <div>
	  </div>
	);
  }
  
  export default PlanValidators;
  const { z } = require('zod');

const createPlanSchema = z.object({
  movie: z.object({
    id: z.number().optional(),
    title: z.string().min(1, 'Movie title is required'),
    poster_path: z.string().optional(),
    backdrop_path: z.string().optional(),
    runtime: z.number().optional(),
    vote_average: z.number().optional(),
    genres: z.array(z.object({ id: z.number().optional(), name: z.string() })).optional(),
  }),
  cinema: z
    .object({
      id: z.string().optional(),
      name: z.string().optional(),
      brand: z.string().optional(),
      screenType: z.string().optional(),
      address: z.string().optional(),
      city: z.string().optional(),
      distanceKm: z.number().optional(),
    })
    .optional(),
  date: z.string().min(1, 'Date is required'),
  time: z.string().min(1, 'Time is required'),
  slotName: z.string().optional(),
  friends: z
    .array(
      z.object({
        id: z.string().optional(),
        name: z.string(),
        avatar: z.string().optional(),
        handle: z.string().optional(),
        status: z.enum(['accepted', 'invited', 'declined']).optional(),
      })
    )
    .optional(),
  notes: z.string().max(1000).optional(),
  seats: z.string().max(200).optional(),
  bookingRef: z.string().max(100).optional(),
  snacks: z.array(z.string()).optional(),
  status: z.enum(['upcoming', 'completed', 'cancelled']).optional(),
});

const updatePlanSchema = createPlanSchema.partial();

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

module.exports = { createPlanSchema, updatePlanSchema, validate };
