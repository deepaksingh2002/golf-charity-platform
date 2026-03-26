import express from 'express';
import { getDashboardStats, getAllUsers, getUserDetail, editUserScore, manageSubscription, getWinnersList, verifyWinner, getCharityReport } from '../controllers/admin.controller.js';
import { protect, adminOnly } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect);
router.use(adminOnly);

router.get('/dashboard', getDashboardStats);
router.get('/users', getAllUsers);
router.get('/users/:id', getUserDetail);
router.put('/users/:userId/scores/:scoreId', editUserScore);
router.put('/users/:userId/subscription', manageSubscription);

router.get('/winners', getWinnersList);
router.put('/draws/:drawId/winners/:winnerId/verify', verifyWinner);

router.get('/charity-report', getCharityReport);

export default router;
