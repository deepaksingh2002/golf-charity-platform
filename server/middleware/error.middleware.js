export const errorHandler = (err, req, res, _next) => {
  console.error(err.stack);
  const statusCode = err.statusCode || err.status || 500;

  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    error: err.error || [],
    data: err.data ?? null,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};
