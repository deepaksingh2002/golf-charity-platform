const express = require('express');
const { body } = require('express-validator');
const { addScore, getScores, updateScore, deleteScore } = require('../controllers/score.controller');
const { protect, subscriberOnly } = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');

const router = express.Router();

const scoreValidationRules = [
  body('value').isInt({ min: 1, max: 45 }).withMessage('Value must be an integer between 1 and 45'),
  body('date').isISO8601().withMessage('Date must be a valid ISO 8601 date format').custom((value) => {
    if (new Date(value) > new Date()) {
      throw new Error('Date cannot be in the future');
    }
    return true;
  })
];

router.use(protect);
router.use(subscriberOnly);

router.post('/', scoreValidationRules, validate, addScore);
router.get('/', getScores);
router.put('/:scoreId', scoreValidationRules, validate, updateScore);
router.delete('/:scoreId', deleteScore);

module.exports = router;
