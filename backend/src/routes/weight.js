const express = require('express');
const { PrismaClient } = require('@prisma/client');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

router.use(authMiddleware);

// Get weight entries
router.get('/', async (req, res) => {
  try {
    const entries = await prisma.weightEntry.findMany({
      where: { userId: req.userId },
      orderBy: { date: 'desc' },
    });
    
    res.json(entries);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch weight entries' });
  }
});

// Add weight entry
router.post('/', async (req, res) => {
  try {
    const { date, weight, muscleMass, bodyFat } = req.body;
    
    const entry = await prisma.weightEntry.create({
      data: {
        date: new Date(date),
        weight,
        muscleMass: muscleMass || null,
        bodyFat: bodyFat || null,
        userId: req.userId,
      },
    });
    
    // Update user's default weight
    await prisma.user.update({
      where: { id: req.userId },
      data: { weight },
    });
    
    res.json(entry);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create weight entry' });
  }
});

// Delete weight entry
router.delete('/:id', async (req, res) => {
  try {
    await prisma.weightEntry.delete({
      where: { id: req.params.id },
    });
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete weight entry' });
  }
});

module.exports = router;
