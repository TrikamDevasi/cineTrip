require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/database');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  // Security guard: refuse to start in production with default JWT secret
  if (
    process.env.NODE_ENV === 'production' &&
    (!process.env.JWT_SECRET ||
      process.env.JWT_SECRET === 'change_this_to_a_long_random_secret_in_production')
  ) {
    console.error('FATAL SECURITY ERROR: Insecure or default JWT_SECRET configured in production.');
    process.exit(1);
  }

  await connectDB();
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`\nCineTrip API Server running on port ${PORT} (0.0.0.0)`);
    console.log(`Health check: http://localhost:${PORT}/health`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}\n`);
  });
};

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
