const express = require('express');
const { PrismaClient } = require('@prisma/client');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

router.use(authMiddleware);

// Get muscu activities
router.get('/', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const activities = await prisma.muscuActivity.findMany({
      where: {
        userId: req.userId,
        ...(startDate && endDate && {
          date: {
            gte: startDate,
            lte: endDate,
          },
        }),
      },
      include: {
        exercise: true,
      },
      orderBy: { date: 'desc' },
    });
    
    res.json(activities);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch activities' });
  }
});

// Add muscu activity
router.post('/', async (req, res) => {
  try {
    const { date, exerciseName, sets, reps, weight } = req.body;
    
    const calories = sets * 5;
    
    // Find or create exercise
    let exercise = await prisma.exercise.findFirst({
      where: { userId: req.userId, name: exerciseName, type: 'muscu' },
    });
    
    if (!exercise) {
      exercise = await prisma.exercise.create({
        data: { name: exerciseName, type: 'muscu', userId: req.userId },
      });
    }
    
    const activity = await prisma.muscuActivity.create({
      data: {
        date: date,
        sets,
        reps,
        weight: weight || 0,
        calories,
        userId: req.userId,
        exerciseId: exercise.id,
      },
      include: {
        exercise: true,
      },
    });
    
    res.json(activity);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create activity' });
  }
});

// Delete muscu activity
router.delete('/:id', async (req, res) => {
  try {
    await prisma.muscuActivity.delete({
      where: { id: req.params.id },
    });
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete activity' });
  }
});

module.exports = router;
