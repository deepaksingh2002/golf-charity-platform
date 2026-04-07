import { ApiError } from './apiError.js';

export const findByIdOrThrow = async (Model, id, message = 'Resource not found', query = {}) => {
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
