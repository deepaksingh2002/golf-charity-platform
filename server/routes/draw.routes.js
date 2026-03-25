const express = require('express');
const { createDraw, simulateDraw, publishDraw, getPublishedDraws, getCurrentDraw, uploadWinnerProof } = require('../controllers/draw.controller');
const { protect, adminOnly, subscriberOnly } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');

const router = express.Router();

router.get('/', getPublishedDraws);
router.get('/current', protect, subscriberOnly, getCurrentDraw);

router.post('/', protect, adminOnly, createDraw);
router.post('/:id/simulate', protect, adminOnly, simulateDraw);
router.post('/:id/publish', protect, adminOnly, publishDraw);

// User uploads proof
router.post('/:id/proof', protect, upload.single('proof'), uploadWinnerProof);

module.exports = router;
