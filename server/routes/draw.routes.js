import express from 'express';
import { body } from 'express-validator';
import { createDraw, simulateDraw, publishDraw, getPublishedDraws, getCurrentDraw, uploadWinnerProof } from '../controllers/draw.controller.js';
import { protect, adminOnly } from '../middleware/auth.middleware.js';
import upload from '../middleware/upload.middleware.js';
import validateRequest from '../utils/validateRequest.js';

const router = express.Router();

const drawValidationRules = [
	body('month').optional().matches(/^\d{4}-(0[1-9]|1[0-2])$/).withMessage('Month must be in YYYY-MM format'),
	body('drawType').optional().isIn(['random', 'algorithmic']).withMessage('Draw type must be random or algorithmic'),
	body('forced').optional().isBoolean().withMessage('Forced must be a boolean value'),
];

router.get('/', getPublishedDraws);
router.get('/current', protect, getCurrentDraw);

router.post('/', protect, adminOnly, drawValidationRules, validateRequest, createDraw);
router.post('/:id/simulate', protect, adminOnly, simulateDraw);
router.post('/:id/publish', protect, adminOnly, publishDraw);

// User uploads proof
router.post('/:id/proof', protect, upload.single('proof'), uploadWinnerProof);

export default router;
