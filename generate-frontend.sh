#!/bin/bash

cd frontend

# Créer la structure des dossiers
mkdir -p src/{api,components,pages,contexts,styles,utils}

# Créer les fichiers principaux React
# Les fichiers seront créés dans un second script pour éviter les problèmes d'échappement

echo "✅ Structure frontend créée!"
echo "📁 Dossiers:"
ls -la src/

