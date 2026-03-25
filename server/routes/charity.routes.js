const express = require('express');
const { getCharities, getCharity, createCharity, updateCharity, deleteCharity, toggleFeatured, addEvent } = require('../controllers/charity.controller');
const { protect, adminOnly } = require('../middleware/auth.middleware');

const router = express.Router();

router.get('/', getCharities);
router.get('/:id', getCharity);

router.post('/', protect, adminOnly, createCharity);
router.put('/:id', protect, adminOnly, updateCharity);
router.delete('/:id', protect, adminOnly, deleteCharity);
router.patch('/:id/featured', protect, adminOnly, toggleFeatured);
router.post('/:id/events', protect, adminOnly, addEvent);

module.exports = router;
