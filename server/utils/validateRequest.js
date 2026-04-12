import { validationResult } from 'express-validator';
import { ApiError } from './apiError.js';

const validateRequest = (req, _res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new ApiError(422, 'Validation failed', errors.array()));
  }

  return next();
};

export default validateRequest;
