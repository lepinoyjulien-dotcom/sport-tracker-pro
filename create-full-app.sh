#!/bin/bash

# Script pour créer tous les fichiers de l'application

echo "🚀 Création de Sport Tracker Pro Full Stack..."

# Backend Routes - Exercises
mkdir -p backend/src/routes
cat > backend/src/routes/exercises.js << 'EOF'
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
EOF

# Backend Routes - Cardio
cat > backend/src/routes/cardio.js << 'EOF'
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
EOF

# Backend Routes - Muscu
cat > backend/src/routes/muscu.js << 'EOF'
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
        date: new Date(date),
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
EOF

# Backend Routes - Weight
cat > backend/src/routes/weight.js << 'EOF'
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
EOF

# Backend Routes - Stats
cat > backend/src/routes/stats.js << 'EOF'
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
EOF

# Backend .env.example
cat > backend/.env.example << 'EOF'
DATABASE_URL="postgresql://user:password@localhost:5432/sporttracker?schema=public"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
PORT=3000
EOF

# Backend .gitignore
cat > backend/.gitignore << 'EOF'
node_modules
.env
dist
*.log
.DS_Store
EOF

# Backend prisma folder
mkdir -p backend/prisma
cp ../database/schema.prisma backend/prisma/schema.prisma

echo "✅ Tous les fichiers backend créés!"
