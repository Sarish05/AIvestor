// backend/middleware/errorHandler.js - Global Error Handler
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Default error
  let error = {
    message: err.message || 'Internal Server Error',
    status: err.statusCode || 500
  };

  // Upstox API errors
  if (err.response?.data?.errors) {
    error.message = err.response.data.errors[0]?.message || 'Upstox API Error';
    error.status = err.response.status || 400;
    error.details = err.response.data.errors;
  }

  // Axios errors
  if (err.isAxiosError) {
    error.message = 'External API Error';
    error.status = err.response?.status || 500;
    error.details = err.response?.data;
  }

  // Validation errors
  if (err.name === 'ValidationError') {
    error.message = 'Validation Error';
    error.status = 400;
    error.details = err.errors;
  }

  // Don't send stack trace in production
  if (process.env.NODE_ENV === 'production') {
    delete err.stack;
  } else {
    error.stack = err.stack;
  }

  res.status(error.status).json({
    success: false,
    error: error.message,
    ...(error.details && { details: error.details }),
    ...(error.stack && { stack: error.stack })
  });
};

module.exports = errorHandler;
