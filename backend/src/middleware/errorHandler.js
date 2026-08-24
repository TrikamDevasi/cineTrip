const errorHandler = (err, req, res, next) => {
  console.error('Error:', err.message);

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ message: messages.join('. ') });
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(409).json({
      message: `${field === 'email' ? 'Email address' : field} is already in use.`,
    });
  }

  // Mongoose cast error (invalid ObjectId)
  if (err.name === 'CastError') {
    return res.status(400).json({ message: 'Invalid ID format.' });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ message: 'Invalid authentication token.' });
  }
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ message: 'Session expired. Please login again.' });
  }

  // Default server error — never expose stack traces in production
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    message:
      process.env.NODE_ENV === 'production'
        ? 'An unexpected error occurred. Please try again.'
        : err.message || 'Server error',
  });
};

module.exports = errorHandler;
