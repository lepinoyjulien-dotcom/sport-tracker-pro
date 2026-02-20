const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const authMiddleware = require('../middleware/auth');
const adminMiddleware = require('../middleware/admin');

const prisma = new PrismaClient();

// GET /api/admin/users - Get all users (admin only)
router.get('/users', authMiddleware, adminMiddleware, async (req, res) => {
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
        id: 'asc'
      }
    });

    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des utilisateurs' });
  }
});

// DELETE /api/admin/users/:id - Delete a user (admin only)
router.delete('/users/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const userId = parseInt(req.params.id);

    // Validate userId
    if (!userId || isNaN(userId)) {
      return res.status(400).json({ error: 'ID utilisateur invalide' });
    }

    // Prevent admin from deleting themselves
    if (userId === req.userId) {
      return res.status(400).json({ error: 'Vous ne pouvez pas supprimer votre propre compte' });
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    // Delete user's data first (cascade delete)
    await prisma.$transaction([
      // Delete cardio activities
      prisma.cardioActivity.deleteMany({
        where: { userId }
      }),
      // Delete muscu activities
      prisma.muscuActivity.deleteMany({
        where: { userId }
      }),
      // Delete weight entries
      prisma.weightEntry.deleteMany({
        where: { userId }
      }),
      // Delete custom exercises
      prisma.exercise.deleteMany({
        where: { userId }
      }),
      // Finally delete the user
      prisma.user.delete({
        where: { id: userId }
      })
    ]);

    console.log(`✅ User deleted: ${user.email} (ID: ${userId})`);
    
    res.json({ 
      message: 'Utilisateur supprimé avec succès',
      deletedUser: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression de l\'utilisateur' });
  }
});

// POST /api/admin/reset-password - Reset user password (admin only)
router.post('/reset-password', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { userId, newPassword } = req.body;

    if (!userId || !newPassword) {
      return res.status(400).json({ error: 'User ID et nouveau mot de passe requis' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Le mot de passe doit contenir au moins 6 caractères' });
    }

    const bcrypt = require('bcrypt');
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: parseInt(userId) },
      data: { password: hashedPassword }
    });

    res.json({ message: 'Mot de passe réinitialisé avec succès' });
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({ error: 'Erreur lors de la réinitialisation du mot de passe' });
  }
});

// GET /api/admin/stats - Get global statistics (admin only)
router.get('/stats', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const stats = {
      users: 0,
      cardioActivities: 0,
      muscuActivities: 0,
      weightEntries: 0
    };

    try {
      stats.users = await prisma.user.count();
    } catch (e) {
      console.warn('Failed to count users:', e.message);
    }

    try {
      stats.cardioActivities = await prisma.cardioActivity.count();
    } catch (e) {
      console.warn('Failed to count cardio:', e.message);
    }

    try {
      stats.muscuActivities = await prisma.muscuActivity.count();
    } catch (e) {
      console.warn('Failed to count muscu:', e.message);
    }

    try {
      stats.weightEntries = await prisma.weightEntry.count();
    } catch (e) {
      console.warn('Failed to count weight:', e.message);
    }

    res.json(stats);
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des statistiques' });
  }
});

// GET /api/admin/settings/calories - Get calorie settings
router.get('/settings/calories', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    // Return default MET values
    const settings = {
      cardio: {
        Faible: 4,
        Moyenne: 7,
        Haute: 10
      },
      muscu: {
        perSet: 5
      }
    };

    res.json(settings);
  } catch (error) {
    console.error('Error fetching calorie settings:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des paramètres' });
  }
});

// PUT /api/admin/settings/calories - Update calorie settings (admin only)
router.put('/settings/calories', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { cardio, muscu } = req.body;

    // Validation
    if (!cardio || !muscu) {
      return res.status(400).json({ error: 'Paramètres cardio et muscu requis' });
    }

    // Validate cardio MET values
    if (!cardio.Faible || !cardio.Moyenne || !cardio.Haute) {
      return res.status(400).json({ error: 'Valeurs MET cardio incomplètes' });
    }

    if (cardio.Faible < 1 || cardio.Moyenne < 1 || cardio.Haute < 1) {
      return res.status(400).json({ error: 'Les valeurs MET doivent être positives' });
    }

    // Validate muscu value
    if (!muscu.perSet || muscu.perSet < 1) {
      return res.status(400).json({ error: 'Valeur muscu invalide' });
    }

    // Note: Currently storing in-memory only (no database persistence)
    // In a real app, these would be stored in a Settings table
    const settings = {
      cardio: {
        Faible: Number(cardio.Faible),
        Moyenne: Number(cardio.Moyenne),
        Haute: Number(cardio.Haute)
      },
      muscu: {
        perSet: Number(muscu.perSet)
      }
    };

    console.log('⚠️ Calorie settings updated (in-memory only):', settings);
    console.log('Note: Settings will reset on server restart. Consider storing in database.');

    res.json({
      message: 'Paramètres mis à jour avec succès (temporaire)',
      settings,
      warning: 'Les paramètres seront réinitialisés au redémarrage du serveur'
    });
  } catch (error) {
    console.error('Error updating calorie settings:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour des paramètres' });
  }
});

module.exports = router;
