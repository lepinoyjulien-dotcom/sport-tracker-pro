# 🚀 Guide de Déploiement - Sport Tracker Pro

Ce guide vous explique comment déployer gratuitement votre application Sport Tracker Pro.

## 📋 Prérequis

- Compte GitHub
- Compte Supabase (gratuit)
- Compte Render (gratuit)
- Compte Vercel (gratuit)

## 🗄️ Étape 1: Base de Données (Supabase)

### 1.1 Créer un projet Supabase

1. Allez sur [supabase.com](https://supabase.com)
2. Créez un compte gratuit
3. Cliquez sur "New Project"
4. Remplissez:
   - **Name**: sport-tracker-db
   - **Database Password**: (créez un mot de passe fort et **notez-le**)
   - **Region**: Choisissez la plus proche
5. Cliquez sur "Create new project"

### 1.2 Récupérer l'URL de connexion

1. Une fois le projet créé, allez dans **Settings** → **Database**
2. Dans la section "Connection string", copiez la chaîne **URI**
3. Elle ressemble à: `postgresql://postgres:[YOUR-PASSWORD]@db.xxx.supabase.co:5432/postgres`
4. Remplacez `[YOUR-PASSWORD]` par votre mot de passe

### 1.3 Initialiser la base de données

```bash
# Dans le dossier backend
cd backend

# Installez les dépendances
npm install

# Créez le fichier .env
echo "DATABASE_URL=\"postgresql://postgres:VOTRE_MOT_DE_PASSE@db.xxx.supabase.co:5432/postgres\"" > .env
echo "JWT_SECRET=\"$(openssl rand -base64 32)\"" >> .env

# Générez le client Prisma
npx prisma generate

# Créez les tables
npx prisma migrate dev --name init
```

✅ Votre base de données est prête!

## 🔧 Étape 2: Backend API (Render)

### 2.1 Préparer le repository Git

```bash
# À la racine du projet
git init
git add .
git commit -m "Initial commit"

# Créez un repo sur GitHub et poussez
git remote add origin https://github.com/VOTRE-USERNAME/sport-tracker-pro.git
git push -u origin main
```

### 2.2 Déployer sur Render

1. Allez sur [render.com](https://render.com)
2. Créez un compte gratuit
3. Cliquez sur "New +" → "Web Service"
4. Connectez votre repository GitHub
5. Configurez:
   - **Name**: sport-tracker-api
   - **Region**: Choisissez la plus proche
   - **Branch**: main
   - **Root Directory**: backend
   - **Runtime**: Node
   - **Build Command**: `npm install && npx prisma generate && npx prisma migrate deploy`
   - **Start Command**: `npm start`
   - **Instance Type**: Free

### 2.3 Variables d'environnement

Dans Render, ajoutez les variables d'environnement:

1. Cliquez sur "Environment" dans votre service
2. Ajoutez:
   - **DATABASE_URL**: `postgresql://postgres:...` (de Supabase)
   - **JWT_SECRET**: `votre-secret-généré-précédemment`
   - **PORT**: `3000`

3. Cliquez sur "Save Changes"

✅ Votre API est déployée! Notez l'URL (ex: `https://sport-tracker-api.onrender.com`)

## 🎨 Étape 3: Frontend (Vercel)

### 3.1 Configurer le frontend

```bash
cd frontend

# Créez le fichier .env
echo "VITE_API_URL=https://sport-tracker-api.onrender.com" > .env
```

### 3.2 Déployer sur Vercel

1. Allez sur [vercel.com](https://vercel.com)
2. Créez un compte gratuit
3. Cliquez sur "Add New..." → "Project"
4. Importez votre repository GitHub
5. Configurez:
   - **Project Name**: sport-tracker-pro
   - **Framework Preset**: Vite
   - **Root Directory**: frontend
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

6. Dans "Environment Variables", ajoutez:
   - **VITE_API_URL**: `https://sport-tracker-api.onrender.com`

7. Cliquez sur "Deploy"

✅ Votre application est en ligne!

## 🎯 Étape 4: Test

1. Ouvrez votre application sur l'URL Vercel (ex: `https://sport-tracker-pro.vercel.app`)
2. Créez un compte
3. Ajoutez une activité
4. Vérifiez que tout fonctionne!

## 🔄 Mises à jour

Pour mettre à jour l'application:

```bash
# Modifiez vos fichiers
git add .
git commit -m "Description des modifications"
git push

# Vercel et Render redéploieront automatiquement!
```

## 🐛 Dépannage

### Backend ne démarre pas

- Vérifiez les logs dans Render
- Assurez-vous que DATABASE_URL est correct
- Vérifiez que les migrations ont été exécutées

### Frontend ne se connecte pas à l'API

- Vérifiez que VITE_API_URL est correct
- Vérifiez que le backend est bien en ligne
- Regardez la console du navigateur pour les erreurs CORS

### Base de données vide

```bash
cd backend
npx prisma migrate deploy
npx prisma db seed # Si vous avez un fichier seed
```

## 📊 Monitoring

- **Supabase**: Tableau de bord → Database → Logs
- **Render**: Dashboard → Logs
- **Vercel**: Dashboard → Deployments → Logs

## 💰 Coûts

- ✅ **Supabase**: Gratuit jusqu'à 500 MB de base de données
- ✅ **Render**: Gratuit avec 750h/mois (service se met en veille après inactivité)
- ✅ **Vercel**: Gratuit avec bande passante illimitée

**Total: 100% GRATUIT! 🎉**

## 🔐 Sécurité

### Recommandations de production:

1. **Changez le JWT_SECRET**: Utilisez un secret fort et unique
2. **HTTPS uniquement**: Activé par défaut sur Vercel/Render
3. **Rate limiting**: Ajoutez express-rate-limit dans le backend
4. **Validation des données**: Ajoutez Joi ou Zod pour valider les inputs
5. **Mise à jour régulière**: `npm audit fix` pour les dépendances

## 📧 Support

En cas de problème:
1. Vérifiez les logs (Render/Vercel)
2. Consultez la documentation Prisma
3. Vérifiez la connexion à la base de données

---

**Félicitations! Votre application est déployée! 🚀**
