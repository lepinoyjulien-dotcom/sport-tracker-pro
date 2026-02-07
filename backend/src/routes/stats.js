const express = require('express');
const { PrismaClient } = require('@prisma/client');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

router.use(authMiddleware);

// Get dashboard stats
router.get('/dashboard', async (req, res) => {
  try {
    const { date } = req.query;
    const targetDate = new Date(date);
    
    const [cardio, muscu, weight] = await Promise.all([
      prisma.cardioActivity.findMany({
        where: {
          userId: req.userId,
          date: targetDate,
        },
        include: { exercise: true },
      }),
      prisma.muscuActivity.findMany({
        where: {
          userId: req.userId,
          date: targetDate,
        },
        include: { exercise: true },
      }),
      prisma.weightEntry.findFirst({
        where: { userId: req.userId },
        orderBy: { date: 'desc' },
      }),
    ]);
    
    res.json({ cardio, muscu, weight });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

module.exports = router;
