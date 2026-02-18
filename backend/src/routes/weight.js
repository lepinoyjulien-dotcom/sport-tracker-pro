const express = require('express');
const { PrismaClient } = require('@prisma/client');
const authMiddleware = require('../middleware/auth');
const router = express.Router();
const prisma = new PrismaClient();

router.use(authMiddleware);

// Get weight entries
router.get('/', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const whereClause = {
      userId: req.userId
    };
    
    if (startDate && endDate) {
      whereClause.date = {
        gte: startDate,
        lte: endDate
      };
    }
    
    const entries = await prisma.weightEntry.findMany({
      where: whereClause,
      orderBy: { date: 'desc' }
    });
    
    res.json(entries);
  } catch (error) {
    console.error('Error fetching weight entries:', error);
    res.status(500).json({ error: 'Failed to fetch weight entries' });
  }
});

// Add weight entry
router.post('/', async (req, res) => {
  try {
    const { date, weight, bodyFat, muscleMass } = req.body;
    
    if (!weight) {
      return res.status(400).json({ error: 'Weight is required' });
    }
    
    const entryDate = date || new Date().toISOString().split('T')[0];
    
    const entry = await prisma.weightEntry.create({
      data: {
        date: entryDate,
        weight: parseFloat(weight),
        bodyFat: bodyFat ? parseFloat(bodyFat) : null,
        muscleMass: muscleMass ? parseFloat(muscleMass) : null,
        userId: req.userId
      }
    });
    
    res.json(entry);
  } catch (error) {
    console.error('Error creating weight entry:', error);
    res.status(500).json({ error: 'Failed to create weight entry' });
  }
});

// Delete weight entry
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const entry = await prisma.weightEntry.findUnique({
      where: { id }
    });
    
    if (!entry) {
      return res.status(404).json({ error: 'Entry not found' });
    }
    
    if (entry.userId !== req.userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    
    await prisma.weightEntry.delete({
      where: { id }
    });
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting weight entry:', error);
    res.status(500).json({ error: 'Failed to delete entry' });
  }
});

module.exports = router;
