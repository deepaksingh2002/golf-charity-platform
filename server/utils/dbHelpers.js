import mongoose from 'mongoose';
import { ApiError } from './apiError.js';

export const ensureObjectId = (id, message = 'Invalid resource id') => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, message);
  }
};

export const findByIdOrThrow = async (
  Model,
  id,
  message = 'Resource not found',
  query = {},
  invalidMessage = 'Invalid resource id'
) => {
  ensureObjectId(id, invalidMessage);

  let queryBuilder = Model.findById(id);

  if (query.select) {
    queryBuilder = queryBuilder.select(query.select);
  }

  if (query.populate) {
    queryBuilder = queryBuilder.populate(query.populate);
  }

  const doc = await queryBuilder;

  if (!doc) {
    throw new ApiError(404, message);
  }

  return doc;
};

export const findLatestUnpublishedDraw = async (Draw) => {
  return Draw.findOne({ status: { $ne: 'published' } }).sort({ createdAt: -1 });
};
