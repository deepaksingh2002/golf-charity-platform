import Charity from '../models/Charity.model.js';
import { ApiError } from '../utils/apiError.js';
import { sendApiResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ensureObjectId } from '../utils/dbHelpers.js';

const CHARITY_FIELDS = ['name', 'description', 'website', 'imageUrl', 'galleryImages'];

const pickCharityFields = (source = {}) =>
  CHARITY_FIELDS.reduce((accumulator, key) => {
    if (source[key] !== undefined) {
      accumulator[key] = source[key];
    }
    return accumulator;
  }, {});

const isValidEvent = (event) => Boolean(event?.title && event?.date);

export const getCharities = asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit) || 10;
  const page = parseInt(req.query.page) || 1;
  const skip = (page - 1) * limit;

  const query = { isActive: true };
  if (req.query.search) {
    query.$or = [
      { name: { $regex: req.query.search, $options: 'i' } },
      { description: { $regex: req.query.search, $options: 'i' } },
    ];
  }

  const [charities, total] = await Promise.all([
    Charity.find(query)
    .sort({ isFeatured: -1, createdAt: -1 })
    .skip(skip)
    .limit(limit),
    Charity.countDocuments(query),
  ]);

  sendApiResponse(res, 200, {
    charities,
    page,
    limit,
    total,
    pages: Math.ceil(total / limit) || 1,
  }, 'Charities loaded successfully', {
  });
});

export const getCharity = asyncHandler(async (req, res) => {
  ensureObjectId(req.params.id, 'Invalid charity id');
  const charity = await Charity.findById(req.params.id);
  if (!charity || !charity.isActive) {
    throw new ApiError(404, 'Charity not found');
  }

  sendApiResponse(res, 200, charity, 'Charity loaded successfully');
});

export const createCharity = asyncHandler(async (req, res) => {
  const charityData = pickCharityFields(req.body);

  const { name } = charityData;
  if (!name) {
    throw new ApiError(400, 'Name is required');
  }

  const charity = await Charity.create(charityData);

  sendApiResponse(res, 201, charity, 'Charity created successfully');
});

export const updateCharity = asyncHandler(async (req, res) => {
  ensureObjectId(req.params.id, 'Invalid charity id');
  const charity = await Charity.findByIdAndUpdate(
    req.params.id,
    pickCharityFields(req.body),
    { new: true, runValidators: true }
  );
  if (!charity) {
    throw new ApiError(404, 'Charity not found');
  }

  sendApiResponse(res, 200, charity, 'Charity updated successfully');
});

export const deleteCharity = asyncHandler(async (req, res) => {
  ensureObjectId(req.params.id, 'Invalid charity id');
  const charity = await Charity.findByIdAndUpdate(
    req.params.id,
    { isActive: false },
    { new: true }
  );
  if (!charity) {
    throw new ApiError(404, 'Charity not found');
  }

  sendApiResponse(res, 200, charity, 'Charity disabled successfully');
});

export const toggleFeatured = asyncHandler(async (req, res) => {
  ensureObjectId(req.params.id, 'Invalid charity id');
  const charity = await Charity.findById(req.params.id);
  if (!charity) {
    throw new ApiError(404, 'Charity not found');
  }

  charity.isFeatured = !charity.isFeatured;
  await charity.save();
  sendApiResponse(res, 200, charity, 'Charity featured status updated successfully');
});

export const addEvent = asyncHandler(async (req, res) => {
  ensureObjectId(req.params.id, 'Invalid charity id');
  const charity = await Charity.findById(req.params.id);
  if (!charity) {
    throw new ApiError(404, 'Charity not found');
  }

  if (!isValidEvent(req.body)) {
    throw new ApiError(400, 'Event title and date are required');
  }

  charity.upcomingEvents.push({
    title: req.body.title,
    date: req.body.date,
    description: req.body.description,
  });
  await charity.save();
  sendApiResponse(res, 200, charity, 'Event added successfully');
});
