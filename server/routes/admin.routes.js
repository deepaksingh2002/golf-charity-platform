const express = require('express');
const { getDashboardStats, getAllUsers, getUserDetail, editUserScore, manageSubscription, getWinnersList, verifyWinner, getCharityReport } = require('../controllers/admin.controller');
const { protect, adminOnly } = require('../middleware/auth.middleware');

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

module.exports = router;
