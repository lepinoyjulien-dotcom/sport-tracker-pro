// backend/src/routes/admin.js
// Routes d'administration - VERSION CORRIGÉE

const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const authMiddleware = require('../middleware/auth');
const adminMiddleware = require('../middleware/admin');

const prisma = new PrismaClient();

// Appliquer les middlewares
router.use(authMiddleware);
router.use(adminMiddleware);

// GET /api/admin/users - Liste utilisateurs (SANS champs inexistants)
router.get('/users', async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        weight: true,
        role: true
      },
      orderBy: {
        name: 'asc'
      }
    });

    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des utilisateurs' });
  }
});

// GET /api/admin/stats - Statistiques globales
router.get('/stats', async (req, res) => {
  try {
    const [totalUsers, totalCardio, totalMuscu, totalWeight] = await Promise.all([
      prisma.user.count(),
      prisma.cardioActivity.count(),
      prisma.muscuActivity.count(),
      prisma.weightEntry.count()
    ]);

    res.json({
      totalUsers,
      totalCardio,
      totalMuscu,
      totalWeight
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des statistiques' });
  }
});

// DELETE /api/admin/users/:id - Supprimer utilisateur
router.delete('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.user.delete({
      where: { id }
    });

    res.json({ success: true, message: 'Utilisateur supprimé' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression' });
  }
});

// PUT /api/admin/users/:id - Modifier utilisateur
router.put('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role, weight } = req.body;

    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (role) updateData.role = role;
    if (weight) updateData.weight = parseFloat(weight);

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        weight: true,
        role: true
      }
    });

    res.json(user);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour' });
  }
});

// GET /api/admin/settings/calories - Récupérer paramètres calories
router.get('/settings/calories', async (req, res) => {
  try {
    // Valeurs par défaut
    const defaultSettings = {
      cardio: {
        low: 4,
        medium: 7,
        high: 10
      },
      muscu: {
        perSet: 5
      }
    };

    // TODO: Stocker en base si besoin
    res.json(defaultSettings);
  } catch (error) {
    console.error('Error fetching calorie settings:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des paramètres' });
  }
});

// PUT /api/admin/settings/calories - Mettre à jour paramètres calories
router.put('/settings/calories', async (req, res) => {
  try {
    const { cardio, muscu } = req.body;

    // Validation
    if (!cardio || !muscu) {
      return res.status(400).json({ error: 'Paramètres incomplets' });
    }

    // TODO: Stocker en base si besoin
    const settings = {
      cardio: {
        low: parseInt(cardio.low) || 4,
        medium: parseInt(cardio.medium) || 7,
        high: parseInt(cardio.high) || 10
      },
      muscu: {
        perSet: parseInt(muscu.perSet) || 5
      }
    };

    res.json(settings);
  } catch (error) {
    console.error('Error updating calorie settings:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour des paramètres' });
  }
});

module.exports = router;
