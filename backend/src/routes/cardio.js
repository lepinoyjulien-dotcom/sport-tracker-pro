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
    
    const activities = await prisma.cardioActivity.findMany({
      where: whereClause,
      include: {
        exercise: true
      },
      orderBy: { date: 'desc' }
    });
    
    res.json(activities);
  } catch (error) {
    console.error('Error fetching cardio activities:', error);
    res.status(500).json({ error: 'Failed to fetch activities' });
  }
});

// Add cardio activity
router.post('/', async (req, res) => {
  try {
    const { date, exerciseName, minutes, intensity } = req.body;
    
    // Validate required fields
    if (!exerciseName || !minutes || !intensity) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Use provided date or today's date
    const activityDate = date || new Date().toISOString().split('T')[0];
    
    // Get user weight for calorie calculation
    const user = await prisma.user.findUnique({ 
      where: { id: req.userId },
      select: { weight: true }
    });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Calculate calories based on MET values
    const metValues = { 
      'Faible': 4, 
      'Moyenne': 7, 
      'Haute': 10 
    };
    const met = metValues[intensity] || 7;
    const calories = Math.round((met * user.weight * minutes) / 60);
    
    // Find existing exercise (user's or default)
    let exercise = await prisma.exercise.findFirst({
      where: {
        name: exerciseName,
        type: 'cardio',
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
          type: 'cardio', 
          userId: req.userId 
        }
      });
    }
    
    // Create activity
    const activity = await prisma.cardioActivity.create({
      data: {
        date: activityDate,
        minutes: parseInt(minutes),
        intensity,
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
    console.error('Error creating cardio activity:', error);
    res.status(500).json({ error: 'Failed to create activity' });
  }
});

// Delete cardio activity
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verify ownership
    const activity = await prisma.cardioActivity.findUnique({
      where: { id }
    });
    
    if (!activity) {
      return res.status(404).json({ error: 'Activity not found' });
    }
    
    if (activity.userId !== req.userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    
    await prisma.cardioActivity.delete({
      where: { id }
    });
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting cardio activity:', error);
    res.status(500).json({ error: 'Failed to delete activity' });
  }
});

module.exports = router;
