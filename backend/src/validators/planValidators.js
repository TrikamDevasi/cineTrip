const { z } = require('zod');

const createPlanSchema = z.object({
  movie: z.object({
    id: z.coerce.number('A verified movie id is required').int().positive(),
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
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be a valid YYYY-MM-DD day'),
  time: z.string().max(10).optional(),
  slotName: z.string().max(60).optional(),
  showtime: z
    .object({
      id: z.string().optional(),
      time: z.string().optional(),
      label: z.string().optional(),
      cinemaId: z.string().optional(),
    })
    .optional(),
  showtimeId: z.string().max(100).optional(),
  bookingStatus: z.enum(['plan', 'pending', 'confirmed', 'cancelled']).optional(),
  ticketingConnected: z.boolean().optional(),
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
  seats: z.union([z.string().max(200), z.array(z.string()).max(60)]).optional(),
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
