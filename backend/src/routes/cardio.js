const express = require('express');
const { PrismaClient } = require('@prisma/client');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

router.use(authMiddleware);

// Get cardio activities
router.get('/', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const activities = await prisma.cardioActivity.findMany({
      where: {
        userId: req.userId,
        ...(startDate && endDate && {
          date: {
            gte: new Date(startDate),
            lte: new Date(endDate),
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

// Add cardio activity
router.post('/', async (req, res) => {
  try {
    const { date, exerciseName, minutes, intensity } = req.body;
    
    // Get user weight for calorie calculation
    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    const met = { 'Faible': 4, 'Moyenne': 7, 'Haute': 10 }[intensity] || 7;
    const calories = Math.round((met * user.weight * minutes) / 60);
    
    // Find or create exercise
    let exercise = await prisma.exercise.findFirst({
      where: { userId: req.userId, name: exerciseName, type: 'cardio' },
    });
    
    if (!exercise) {
      exercise = await prisma.exercise.create({
        data: { name: exerciseName, type: 'cardio', userId: req.userId },
      });
    }
    
    const activity = await prisma.cardioActivity.create({
      data: {
        date: new Date(date),
        minutes,
        intensity,
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
    console.error(error);
    res.status(500).json({ error: 'Failed to create activity' });
  }
});

// Delete cardio activity
router.delete('/:id', async (req, res) => {
  try {
    await prisma.cardioActivity.delete({
      where: { id: req.params.id },
    });
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete activity' });
  }
});

module.exports = router;
