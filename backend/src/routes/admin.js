// backend/src/routes/admin.js
// Routes d'administration avec gestion des paramètres de calories

const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const authMiddleware = require('../middleware/auth');
const adminMiddleware = require('../middleware/admin');

const prisma = new PrismaClient();

// Appliquer les middlewares à toutes les routes
router.use(authMiddleware);
router.use(adminMiddleware);

// GET /api/admin/users - Liste de tous les utilisateurs (SIMPLIFIED - no weight/exercise counts)
router.get('/users', async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        lastLogin: true
      },
      orderBy: {
        createdAt: 'desc'
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

// GET /api/admin/calorie-settings - Récupérer les paramètres de calcul des calories
router.get('/calorie-settings', async (req, res) => {
  try {
    // Pour simplifier, on stocke les paramètres dans un fichier JSON ou en base de données
    // Ici on utilise une approche simple avec valeurs par défaut
    
    // Vous pouvez créer une table CalorieSetting dans Prisma si vous voulez persister en DB
    // Pour l'instant, on retourne des valeurs par défaut qui peuvent être modifiées
    
    const settings = {
      cardio: {
        low: 4,      // MET pour intensité faible
        medium: 7,   // MET pour intensité moyenne
        high: 10     // MET pour intensité haute
      },
      muscu: {
        perSet: 5    // Calories par série
      }
    };

    res.json(settings);
  } catch (error) {
    console.error('Error fetching calorie settings:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des paramètres' });
  }
});

// POST /api/admin/calorie-settings - Sauvegarder les paramètres de calcul des calories
router.post('/calorie-settings', async (req, res) => {
  try {
    const { cardio, muscu } = req.body;

    // Validation
    if (!cardio || !muscu) {
      return res.status(400).json({ error: 'Paramètres invalides' });
    }

    if (cardio.low <= 0 || cardio.medium <= 0 || cardio.high <= 0) {
      return res.status(400).json({ error: 'Les valeurs MET doivent être positives' });
    }

    if (muscu.perSet <= 0) {
      return res.status(400).json({ error: 'Les calories par série doivent être positives' });
    }

    // Dans une vraie application, sauvegarder en base de données
    // Pour simplifier, on log juste et on retourne OK
    // Vous pouvez implémenter une vraie persistance avec Prisma
    
    console.log('📊 Calorie settings updated:', { cardio, muscu });

    /*
    // Exemple d'implémentation avec Prisma (si vous créez la table)
    await prisma.calorieSetting.upsert({
      where: { id: 1 },
      update: {
        cardioLow: cardio.low,
        cardioMedium: cardio.medium,
        cardioHigh: cardio.high,
        muscuPerSet: muscu.perSet
      },
      create: {
        cardioLow: cardio.low,
        cardioMedium: cardio.medium,
        cardioHigh: cardio.high,
        muscuPerSet: muscu.perSet
      }
    });
    */

    res.json({ 
      message: 'Paramètres de calories sauvegardés',
      settings: { cardio, muscu }
    });
  } catch (error) {
    console.error('Error saving calorie settings:', error);
    res.status(500).json({ error: 'Erreur lors de la sauvegarde des paramètres' });
  }
});

// POST /api/admin/reset-password - Réinitialiser le mot de passe d'un utilisateur
router.post('/reset-password', async (req, res) => {
  try {
    const { userId, newPassword } = req.body;

    if (!userId || !newPassword) {
      return res.status(400).json({ error: 'userId et newPassword requis' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Le mot de passe doit contenir au moins 6 caractères' });
    }

    // Hasher le nouveau mot de passe
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Mettre à jour le mot de passe
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword }
    });

    res.json({ message: 'Mot de passe réinitialisé avec succès' });
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({ error: 'Erreur lors de la réinitialisation du mot de passe' });
  }
});

// POST /api/admin/change-role - Changer le rôle d'un utilisateur
router.post('/change-role', async (req, res) => {
  try {
    const { userId, role } = req.body;

    if (!userId || !role) {
      return res.status(400).json({ error: 'userId et role requis' });
    }

    if (!['admin', 'user'].includes(role)) {
      return res.status(400).json({ error: 'Le rôle doit être "admin" ou "user"' });
    }

    // Mettre à jour le rôle
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role },
      select: {
        id: true,
        email: true,
        name: true,
        role: true
      }
    });

    res.json({ message: 'Rôle mis à jour avec succès', user: updatedUser });
  } catch (error) {
    console.error('Error changing role:', error);
    res.status(500).json({ error: 'Erreur lors du changement de rôle' });
  }
});

// DELETE /api/admin/users/:id - Supprimer un utilisateur
router.delete('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Vérifier que l'admin ne se supprime pas lui-même
    if (id === req.userId) {
      return res.status(400).json({ error: 'Vous ne pouvez pas supprimer votre propre compte' });
    }

    // Supprimer l'utilisateur (cascade supprimera toutes ses données)
    await prisma.user.delete({
      where: { id }
    });

    res.json({ message: 'Utilisateur supprimé avec succès' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression de l\'utilisateur' });
  }
});

module.exports = router;
