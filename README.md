# 💪 Sport Tracker Pro - Application Full Stack

Application complète de suivi sportif avec frontend React, backend Node.js/Express et base de données PostgreSQL.

## 🏗️ Architecture

- **Frontend**: React + Vite + TailwindCSS
- **Backend**: Node.js + Express + Prisma ORM
- **Base de données**: PostgreSQL (gratuit sur Supabase)
- **Déploiement**: 
  - Frontend: Vercel (gratuit)
  - Backend: Render (gratuit)
  - Database: Supabase (gratuit)

## 📦 Structure du projet

```
sport-tracker-app/
├── frontend/          # Application React
├── backend/           # API Node.js/Express
├── database/          # Scripts et migrations Prisma
└── docs/             # Documentation de déploiement
```

## 🚀 Déploiement gratuit

### 1. Base de données (Supabase)
- Créer un compte sur supabase.com
- Créer un nouveau projet
- Copier l'URL de connexion PostgreSQL

### 2. Backend (Render)
- Connecter votre repo GitHub à Render
- Déployer le dossier `backend`
- Configurer les variables d'environnement

### 3. Frontend (Vercel)
- Connecter votre repo GitHub à Vercel
- Déployer le dossier `frontend`
- Configurer l'URL de l'API backend

## ⚙️ Installation locale

```bash
# Backend
cd backend
npm install
npx prisma migrate dev
npm run dev

# Frontend
cd frontend
npm install
npm run dev
```

## 🔐 Variables d'environnement

### Backend (.env)
```
DATABASE_URL="postgresql://..."
JWT_SECRET="votre-secret"
PORT=3000
```

### Frontend (.env)
```
VITE_API_URL="http://localhost:3000"
```

## 📱 Fonctionnalités

- ✅ Suivi des activités cardio avec intensités
- ✅ Suivi de la musculation (séries, reps, poids)
- ✅ Tracking du poids corporel et composition
- ✅ Calcul automatique des calories
- ✅ Graphiques d'évolution détaillés
- ✅ Statistiques avancées par exercice
- ✅ Authentification utilisateur
- ✅ Données persistantes en BDD
- ✅ Interface responsive et moderne

## 📄 Licence

MIT
