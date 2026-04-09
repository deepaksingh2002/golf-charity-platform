import express from 'express';
import { body } from 'express-validator';
import { addScore, getScores, updateScore, deleteScore } from '../controllers/score.controller.js';
import { protect, subscriberOnly } from '../middleware/auth.middleware.js';
import validate from '../middleware/validate.middleware.js';

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
const scoreUpdateValidationRules = [
  body('value').optional().isInt({ min: 1, max: 45 }).withMessage('Value must be an integer between 1 and 45'),
  body('date').optional().isISO8601().withMessage('Date must be a valid ISO 8601 date format').custom((value) => {
    if (new Date(value) > new Date()) {
      throw new Error('Date cannot be in the future');
    }
    return true;
  })
];

router.use(protect);

router.get('/', getScores);

router.use(subscriberOnly);

router.post('/', scoreValidationRules, validate, addScore);
router.put('/:scoreId', scoreUpdateValidationRules, validate, updateScore);
router.delete('/:scoreId', deleteScore);

export default router;
