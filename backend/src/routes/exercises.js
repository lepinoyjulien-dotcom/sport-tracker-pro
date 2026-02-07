const express = require('express');
const { PrismaClient } = require('@prisma/client');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

router.use(authMiddleware);

// Get all exercises
router.get('/', async (req, res) => {
  try {
    const exercises = await prisma.exercise.findMany({
      where: { userId: req.userId },
      orderBy: { name: 'asc' },
    });
    
    const cardio = exercises.filter(e => e.type === 'cardio').map(e => e.name);
    const muscu = exercises.filter(e => e.type === 'muscu').map(e => e.name);
    
    res.json({ cardio, muscu });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch exercises' });
  }
});

// Add exercise
router.post('/', async (req, res) => {
  try {
    const { name, type } = req.body;
    
    const exercise = await prisma.exercise.create({
      data: {
        name,
        type,
        userId: req.userId,
      },
    });
    
    res.json(exercise);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create exercise' });
  }
});

// Delete exercise
router.delete('/:id', async (req, res) => {
  try {
    await prisma.exercise.delete({
      where: { id: req.params.id },
    });
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete exercise' });
  }
});

module.exports = router;
