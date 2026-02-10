// backend/src/routes/exercises.js
// Routes pour la gestion des exercices personnalisés

const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const authMiddleware = require('../middleware/auth');

const prisma = new PrismaClient();

// Appliquer le middleware d'authentification
router.use(authMiddleware);

// GET /api/exercises - Liste des exercices
router.get('/', async (req, res) => {
  try {
    const { type } = req.query;
    
    // Récupérer les exercices de l'utilisateur + les exercices par défaut
    const exercises = await prisma.exercise.findMany({
      where: {
        OR: [
          { userId: req.userId },  // Exercices personnels
          { userId: null }         // Exercices par défaut (système)
        ],
        ...(type && { type })      // Filtrer par type si fourni
      },
      orderBy: { name: 'asc' }
    });
    
    res.json(exercises);
  } catch (error) {
    console.error('Error fetching exercises:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des exercices' });
  }
});

// POST /api/exercises - Créer un nouvel exercice
router.post('/', async (req, res) => {
  try {
    const { name, type } = req.body;
    
    // Validation
    if (!name || !type) {
      return res.status(400).json({ error: 'Le nom et le type sont requis' });
    }
    
    if (!['cardio', 'muscu'].includes(type)) {
      return res.status(400).json({ error: 'Le type doit être cardio ou muscu' });
    }
    
    // Vérifier si l'exercice existe déjà pour cet utilisateur
    const existing = await prisma.exercise.findFirst({
      where: {
        name,
        type,
        userId: req.userId
      }
    });
    
    if (existing) {
      return res.status(400).json({ error: 'Cet exercice existe déjà' });
    }
    
    // Créer l'exercice
    const exercise = await prisma.exercise.create({
      data: {
        name,
        type,
        userId: req.userId
      }
    });
    
    res.status(201).json(exercise);
  } catch (error) {
    console.error('Error creating exercise:', error);
    res.status(500).json({ error: 'Erreur lors de la création de l\'exercice' });
  }
});

// PUT /api/exercises/:id - Modifier un exercice
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Le nom est requis' });
    }
    
    // Récupérer l'exercice
    const exercise = await prisma.exercise.findUnique({
      where: { id }
    });
    
    if (!exercise) {
      return res.status(404).json({ error: 'Exercice non trouvé' });
    }
    
    // Récupérer l'utilisateur pour vérifier son rôle
    const user = await prisma.user.findUnique({
      where: { id: req.userId }
    });
    
    // Vérifier les permissions
    // Un utilisateur peut modifier ses propres exercices
    // Un admin peut modifier tous les exercices
    const canModify = 
      exercise.userId === req.userId ||  // Ses propres exercices
      user.role === 'admin';              // Admin peut tout modifier
    
    if (!canModify) {
      return res.status(403).json({ error: 'Non autorisé à modifier cet exercice' });
    }
    
    // Mettre à jour l'exercice
    const updated = await prisma.exercise.update({
      where: { id },
      data: { name }
    });
    
    res.json(updated);
  } catch (error) {
    console.error('Error updating exercise:', error);
    res.status(500).json({ error: 'Erreur lors de la modification de l\'exercice' });
  }
});

// DELETE /api/exercises/:id - Supprimer un exercice
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Récupérer l'exercice
    const exercise = await prisma.exercise.findUnique({
      where: { id }
    });
    
    if (!exercise) {
      return res.status(404).json({ error: 'Exercice non trouvé' });
    }
    
    // Récupérer l'utilisateur pour vérifier son rôle
    const user = await prisma.user.findUnique({
      where: { id: req.userId }
    });
    
    // Vérifier les permissions
    const canDelete = 
      exercise.userId === req.userId ||  // Ses propres exercices
      user.role === 'admin';              // Admin peut tout supprimer
    
    if (!canDelete) {
      return res.status(403).json({ error: 'Non autorisé à supprimer cet exercice' });
    }
    
    // Supprimer l'exercice
    await prisma.exercise.delete({
      where: { id }
    });
    
    res.json({ message: 'Exercice supprimé avec succès' });
  } catch (error) {
    console.error('Error deleting exercise:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression de l\'exercice' });
  }
});

module.exports = router;
