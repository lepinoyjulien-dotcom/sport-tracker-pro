// backend/src/middleware/admin.js
// Middleware pour vérifier que l'utilisateur est administrateur

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const adminMiddleware = async (req, res, next) => {
  try {
    // req.userId est défini par le middleware auth
    if (!req.userId) {
      return res.status(401).json({ error: 'Non authentifié' });
    }

    // Récupérer l'utilisateur
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { role: true }
    });

    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    // Vérifier que l'utilisateur est admin
    if (user.role !== 'admin') {
      return res.status(403).json({ 
        error: 'Accès refusé',
        message: 'Vous devez être administrateur pour accéder à cette ressource'
      });
    }

    // L'utilisateur est admin, continuer
    next();
  } catch (error) {
    console.error('Error in admin middleware:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

module.exports = adminMiddleware;
