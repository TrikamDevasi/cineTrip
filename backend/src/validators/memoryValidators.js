const { z } = require('zod');

const createMemorySchema = z.object({
  movie: z.object({
    id: z.number().optional(),
    title: z.string().min(1, 'Movie title is required'),
    poster_path: z.string().optional(),
    backdrop_path: z.string().optional(),
    release_date: z.string().optional(),
  }),
  watchedDate: z.string().min(1, 'Watch date is required'),
  experienceType: z.string().optional(),
  cinemaName: z.string().optional(),
  rating: z.number().min(1).max(5).optional(),
  story: z.string().max(2000).optional(),
  favoriteMoment: z.string().max(500).optional(),
  companions: z
    .array(z.object({ name: z.string(), avatar: z.string().optional() }))
    .optional(),
  snackHighlight: z.string().max(200).optional(),
  photoUri: z.string().optional(),
  videoUri: z.string().optional(),
  location: z
    .object({
      latitude: z.number().optional(),
      longitude: z.number().optional(),
      address: z.string().optional(),
    })
    .optional(),
});

const updateMemorySchema = createMemorySchema.partial();

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

module.exports = { createMemorySchema, updateMemorySchema, validate };
