import express from 'express';
import { body } from 'express-validator';
import { getCharities, getCharity, createCharity, updateCharity, deleteCharity, toggleFeatured, addEvent } from '../controllers/charity.controller.js';
import { protect, adminOnly } from '../middleware/auth.middleware.js';
import validateRequest from '../utils/validateRequest.js';

const router = express.Router();

const charityValidationRules = [
	body('name', 'Name is required').trim().notEmpty(),
	body('website').optional({ values: 'falsy' }).isURL().withMessage('Website must be a valid URL'),
];

const charityUpdateValidationRules = [
	body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
	body('website').optional({ values: 'falsy' }).isURL().withMessage('Website must be a valid URL'),
];

const charityEventValidationRules = [
	body('title', 'Event title is required').trim().notEmpty(),
	body('date', 'Event date is required').isISO8601().withMessage('Event date must be a valid date'),
	body('description').optional().isString(),
];

router.get('/', getCharities);
router.get('/:id', getCharity);

router.post('/', protect, adminOnly, charityValidationRules, validateRequest, createCharity);
router.put('/:id', protect, adminOnly, charityUpdateValidationRules, validateRequest, updateCharity);
router.delete('/:id', protect, adminOnly, deleteCharity);
router.patch('/:id/featured', protect, adminOnly, toggleFeatured);
router.post('/:id/events', protect, adminOnly, charityEventValidationRules, validateRequest, addEvent);

export default router;
