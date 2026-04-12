class ApiError extends Error {
  constructor(statusCode, message = 'Something went wrong', errors = [], stack = '') {
    super(message);
    this.statusCode = statusCode;
    this.data = null;
    this.message = message;
    this.success = false;
    this.error = errors;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

const toStatusCode = (error) => {
  const statusCode = Number(error?.statusCode || error?.status);
  if (Number.isInteger(statusCode) && statusCode >= 400 && statusCode < 600) {
    return statusCode;
  }
  return 500;
};

const toApiError = (error) => {
  if (error instanceof ApiError) {
    return error;
  }

  if (error?.name === 'MulterError' && error?.code === 'LIMIT_FILE_SIZE') {
    return new ApiError(400, 'File is too large');
  }

  const statusCode = toStatusCode(error);
  const message = error?.message || (statusCode === 500 ? 'Internal server error' : 'Request failed');
  const errors = Array.isArray(error?.error)
    ? error.error
    : Array.isArray(error?.errors)
      ? error.errors
      : [];

  return new ApiError(statusCode, message, errors, error?.stack || '');
};

const notFoundHandler = (req, _res, next) => {
  next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`));
};

const errorHandler = (error, _req, res, _next) => {
  const apiError = toApiError(error);

  if (apiError.statusCode >= 500) {
    console.error(apiError);
  }

  const payload = {
    statusCode: apiError.statusCode,
    data: null,
    message: apiError.message,
    success: false,
    error: Array.isArray(apiError.error) ? apiError.error : [],
  };

  if (process.env.NODE_ENV !== 'production' && apiError.stack) {
    payload.stack = apiError.stack;
  }

  return res.status(apiError.statusCode).json(payload);
};

export { ApiError, toApiError, notFoundHandler, errorHandler };
