import Charity from '../models/Charity.model.js';
import { ApiError } from '../utils/apiError.js';
import { sendApiResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getCharities = asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit) || 10;
  const page = parseInt(req.query.page) || 1;
  const skip = (page - 1) * limit;

  const query = { isActive: true };
  if (req.query.search) {
    query.$or = [
      { name: { $regex: req.query.search, $options: 'i' } },
      { description: { $regex: req.query.search, $options: 'i' } }
    ];
  }

  const charities = await Charity.find(query)
    .sort({ isFeatured: -1, createdAt: -1 })
    .skip(skip)
    .limit(limit);

  sendApiResponse(res, 200, charities, 'Charities loaded successfully', { collectionKey: 'charities' });
});

export const getCharity = asyncHandler(async (req, res) => {
  const charity = await Charity.findById(req.params.id);
  if (!charity || !charity.isActive) {
    throw new ApiError(404, 'Charity not found');
  }

  sendApiResponse(res, 200, charity, 'Charity loaded successfully', { legacy: true });
});

export const createCharity = asyncHandler(async (req, res) => {
  const { name, description, website, imageUrl, galleryImages } = req.body;
  if (!name) {
    throw new ApiError(400, 'Name is required');
  }

  const charity = await Charity.create({
    name,
    description,
    website,
    imageUrl,
    galleryImages
  });

  sendApiResponse(res, 201, charity, 'Charity created successfully', { legacy: true });
});

export const updateCharity = asyncHandler(async (req, res) => {
  const charity = await Charity.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!charity) {
    throw new ApiError(404, 'Charity not found');
  }

  sendApiResponse(res, 200, charity, 'Charity updated successfully', { legacy: true });
});

export const deleteCharity = asyncHandler(async (req, res) => {
  const charity = await Charity.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
  if (!charity) {
    throw new ApiError(404, 'Charity not found');
  }

  sendApiResponse(res, 200, { charity }, 'Charity disabled', { legacy: true });
});

export const toggleFeatured = asyncHandler(async (req, res) => {
  const charity = await Charity.findById(req.params.id);
  if (!charity) {
    throw new ApiError(404, 'Charity not found');
  }

  charity.isFeatured = !charity.isFeatured;
  await charity.save();
  sendApiResponse(res, 200, charity, 'Charity featured status updated successfully', { legacy: true });
});

export const addEvent = asyncHandler(async (req, res) => {
  const charity = await Charity.findById(req.params.id);
  if (!charity) {
    throw new ApiError(404, 'Charity not found');
  }

  charity.upcomingEvents.push(req.body);
  await charity.save();
  sendApiResponse(res, 200, charity, 'Event added successfully', { legacy: true });
});
