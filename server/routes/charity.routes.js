import express from 'express';
import { getCharities, getCharity, createCharity, updateCharity, deleteCharity, toggleFeatured, addEvent } from '../controllers/charity.controller.js';
import { protect, adminOnly } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/', getCharities);
router.get('/:id', getCharity);

router.post('/', protect, adminOnly, createCharity);
router.put('/:id', protect, adminOnly, updateCharity);
router.delete('/:id', protect, adminOnly, deleteCharity);
router.patch('/:id/featured', protect, adminOnly, toggleFeatured);
router.post('/:id/events', protect, adminOnly, addEvent);

export default router;
