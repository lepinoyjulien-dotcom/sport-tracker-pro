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
    
    const whereClause = {
      userId: req.userId
    };
    
    // Filter by date range if provided
    if (startDate && endDate) {
      whereClause.date = {
        gte: startDate,
        lte: endDate
      };
    }
    
    const activities = await prisma.muscuActivity.findMany({
      where: whereClause,
      include: {
        exercise: true
      },
      orderBy: { date: 'desc' }
    });
    
    res.json(activities);
  } catch (error) {
    console.error('Error fetching muscu activities:', error);
    res.status(500).json({ error: 'Failed to fetch activities' });
  }
});

// Add muscu activity
router.post('/', async (req, res) => {
  try {
    const { date, exerciseName, sets, reps, weight } = req.body;
    
    // Validate required fields
    if (!exerciseName || !sets || !reps) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Use provided date or today's date
    const activityDate = date || new Date().toISOString().split('T')[0];
    
    // Calculate calories (5 calories per set as baseline)
    const calories = Math.round(sets * 5);
    
    // Find existing exercise (user's or default)
    let exercise = await prisma.exercise.findFirst({
      where: {
        name: exerciseName,
        type: 'muscu',
        OR: [
          { userId: req.userId },
          { userId: null }
        ]
      }
    });
    
    // Create new exercise if doesn't exist
    if (!exercise) {
      exercise = await prisma.exercise.create({
        data: { 
          name: exerciseName, 
          type: 'muscu', 
          userId: req.userId 
        }
      });
    }
    
    // Create activity
    const activity = await prisma.muscuActivity.create({
      data: {
        date: activityDate,
        sets: parseInt(sets),
        reps: parseInt(reps),
        weight: weight ? parseFloat(weight) : 0,
        calories,
        userId: req.userId,
        exerciseId: exercise.id
      },
      include: {
        exercise: true
      }
    });
    
    res.json(activity);
  } catch (error) {
    console.error('Error creating muscu activity:', error);
    res.status(500).json({ error: 'Failed to create activity' });
  }
});

// Delete muscu activity
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verify ownership
    const activity = await prisma.muscuActivity.findUnique({
      where: { id }
    });
    
    if (!activity) {
      return res.status(404).json({ error: 'Activity not found' });
    }
    
    if (activity.userId !== req.userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    
    await prisma.muscuActivity.delete({
      where: { id }
    });
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting muscu activity:', error);
    res.status(500).json({ error: 'Failed to delete activity' });
  }
});

module.exports = router;
