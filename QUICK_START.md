# ⚡ Quick Start - Sport Tracker Pro

## 📦 Installation Rapide (Local)

### 1. Cloner le projet
```bash
git clone https://github.com/VOTRE-USERNAME/sport-tracker-pro.git
cd sport-tracker-pro
```

### 2. Backend
```bash
cd backend
npm install

# Configurer la base de données
cp .env.example .env
# Éditez .env et ajoutez votre DATABASE_URL de Supabase

# Initialiser la base de données
npx prisma generate
npx prisma migrate dev

# Démarrer le serveur
npm run dev
# ✅ API démarrée sur http://localhost:3000
```

### 3. Frontend
```bash
cd ../frontend
npm install

# Configurer l'API
cp .env.example .env
# VITE_API_URL=http://localhost:3000

# Démarrer l'application
npm run dev
# ✅ App démarrée sur http://localhost:5173
```

### 4. Tester
- Ouvrez http://localhost:5173
- Créez un compte
- Commencez à tracker! 💪

## 📁 Structure Complète

```
sport-tracker-app/
├── README.md                   # Documentation principale
├── DEPLOY_GUIDE.md            # Guide de déploiement détaillé
├── QUICK_START.md             # Ce fichier
│
├── backend/                    # API Node.js/Express
│   ├── src/
│   │   ├── server.js          # Point d'entrée
│   │   ├── middleware/
│   │   │   └── auth.js        # Authentification JWT
│   │   └── routes/
│   │       ├── auth.js        # Login/Register
│   │       ├── cardio.js      # Activités cardio
│   │       ├── muscu.js       # Activités muscu
│   │       ├── weight.js      # Suivi du poids
│   │       ├── exercises.js   # Gestion des exercices
│   │       └── stats.js       # Statistiques
│   ├── prisma/
│   │   └── schema.prisma      # Schéma de base de données
│   ├── package.json
│   ├── .env.example
│   └── .gitignore
│
├── frontend/                   # Application React
│   ├── src/
│   │   ├── main.jsx           # Point d'entrée React
│   │   ├── App.jsx            # Composant principal
│   │   ├── api/               # Client API
│   │   ├── components/        # Composants réutilisables
│   │   ├── pages/             # Pages de l'application
│   │   ├── contexts/          # Contextes React
│   │   └── styles/            # CSS global
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── .gitignore
│
└── database/
    └── schema.prisma           # Schéma source
```

## 🎯 Fonctionnalités

### ✅ Authentification
- Inscription / Connexion
- JWT tokens sécurisés
- Session persistante

### ✅ Suivi Cardio
- Multiples types d'exercices
- 3 niveaux d'intensité
- Calcul automatique des calories

### ✅ Suivi Musculation  
- Séries, répétitions, poids
- Calcul du volume total
- Progression par exercice

### ✅ Composition Corporelle
- Poids
- Masse musculaire
- Masse grasse

### ✅ Statistiques Avancées
- Graphiques d'évolution
- Analyse par exercice
- Écarts de progression

## 🚀 Prêt pour le Déploiement?

Suivez le [DEPLOY_GUIDE.md](./DEPLOY_GUIDE.md) pour déployer gratuitement!

## 💡 Développement

### Backend
```bash
npm run dev     # Mode développement avec nodemon
npm start       # Mode production
npx prisma studio  # Interface graphique BDD
```

### Frontend
```bash
npm run dev     # Mode développement
npm run build   # Build production
npm run preview # Preview du build
```

## 🔧 Commandes Utiles

### Réinitialiser la BDD
```bash
cd backend
npx prisma migrate reset
npx prisma migrate dev
```

### Voir les données
```bash
cd backend
npx prisma studio
# Ouvre une interface web sur http://localhost:5555
```

### Tests API
```bash
# Health check
curl http://localhost:3000/health

# Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"password123","name":"Test User"}'
```

---

**Bon développement! 💪**
