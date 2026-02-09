// backend/src/routes/profile.js
// Routes de gestion du profil utilisateur

const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const authMiddleware = require('../middleware/auth');

const prisma = new PrismaClient();

// Appliquer le middleware d'authentification à toutes les routes
router.use(authMiddleware);

// GET /api/profile - Obtenir le profil de l'utilisateur connecté
router.get('/', async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: {
        id: true,
        email: true,
        name: true,
        weight: true,
        role: true,
        createdAt: true,
        lastLogin: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération du profil' });
  }
});

// PUT /api/profile - Mettre à jour le profil
router.put('/', async (req, res) => {
  try {
    const { name, email, weight } = req.body;

    // Validation
    if (!name || !email || !weight) {
      return res.status(400).json({ error: 'Nom, email et poids requis' });
    }

    if (weight <= 0) {
      return res.status(400).json({ error: 'Le poids doit être positif' });
    }

    // Vérifier si l'email est déjà utilisé par un autre utilisateur
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser && existingUser.id !== req.userId) {
      return res.status(400).json({ error: 'Cet email est déjà utilisé' });
    }

    // Mettre à jour le profil
    const updatedUser = await prisma.user.update({
      where: { id: req.userId },
      data: {
        name,
        email,
        weight: parseFloat(weight)
      },
      select: {
        id: true,
        email: true,
        name: true,
        weight: true,
        role: true,
        createdAt: true
      }
    });

    res.json({
      message: 'Profil mis à jour avec succès',
      user: updatedUser
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour du profil' });
  }
});

// POST /api/profile/change-password - Changer le mot de passe
router.post('/change-password', async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Validation
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Mot de passe actuel et nouveau mot de passe requis' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Le nouveau mot de passe doit contenir au moins 6 caractères' });
    }

    // Récupérer l'utilisateur avec le mot de passe
    const user = await prisma.user.findUnique({
      where: { id: req.userId }
    });

    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    // Vérifier le mot de passe actuel
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Mot de passe actuel incorrect' });
    }

    // Hasher le nouveau mot de passe
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Mettre à jour le mot de passe
    await prisma.user.update({
      where: { id: req.userId },
      data: { password: hashedPassword }
    });

    res.json({ message: 'Mot de passe changé avec succès' });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ error: 'Erreur lors du changement de mot de passe' });
  }
});

// DELETE /api/profile - Supprimer son propre compte
router.delete('/', async (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ error: 'Mot de passe requis pour supprimer le compte' });
    }

    // Récupérer l'utilisateur
    const user = await prisma.user.findUnique({
      where: { id: req.userId }
    });

    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    // Vérifier le mot de passe
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Mot de passe incorrect' });
    }

    // Supprimer le compte
    await prisma.user.delete({
      where: { id: req.userId }
    });

    res.json({ message: 'Compte supprimé avec succès' });
  } catch (error) {
    console.error('Error deleting account:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression du compte' });
  }
});

module.exports = router;
