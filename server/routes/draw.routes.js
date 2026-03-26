import express from 'express';
import { createDraw, simulateDraw, publishDraw, getPublishedDraws, getCurrentDraw, uploadWinnerProof } from '../controllers/draw.controller.js';
import { protect, adminOnly, subscriberOnly } from '../middleware/auth.middleware.js';
import upload from '../middleware/upload.middleware.js';

const router = express.Router();

router.get('/', getPublishedDraws);
router.get('/current', protect, subscriberOnly, getCurrentDraw);

router.post('/', protect, adminOnly, createDraw);
router.post('/:id/simulate', protect, adminOnly, simulateDraw);
router.post('/:id/publish', protect, adminOnly, publishDraw);

// User uploads proof
router.post('/:id/proof', protect, upload.single('proof'), uploadWinnerProof);

export default router;
