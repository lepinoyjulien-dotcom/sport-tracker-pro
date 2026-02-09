#!/bin/bash
# Render Build Script
# This script runs during deployment to apply database migrations

set -e

echo "📦 Installing dependencies..."
cd backend
npm install

echo "🔧 Generating Prisma Client..."
npx prisma generate

echo "🔄 Applying database migrations..."
npx prisma migrate deploy

echo "✅ Build completed successfully!"
