// backend/prisma/seed.js
// Script pour peupler la base avec les exercices par défaut

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Exercices cardio par défaut
  const cardioExercises = [
    'Course',
    'Vélo',
    'Natation',
    'Elliptique',
    'Rameur',
    'Marche',
    'Corde à sauter',
    'Escaliers',
    'Stepper',
    'HIIT'
  ];

  // Exercices muscu par défaut
  const muscuExercises = [
    'Développé couché',
    'Squat',
    'Soulevé de terre',
    'Développé militaire',
    'Curl biceps',
    'Tractions',
    'Dips',
    'Rowing',
    'Leg press',
    'Extension mollets',
    'Développé incliné',
    'Leg curl'
  ];

  // Créer exercices cardio
  for (const name of cardioExercises) {
    await prisma.exercise.upsert({
      where: { id: `ex-cardio-${cardioExercises.indexOf(name) + 1}` },
      update: {},
      create: {
        id: `ex-cardio-${cardioExercises.indexOf(name) + 1}`,
        name,
        type: 'cardio',
        userId: null
      }
    });
  }

  // Créer exercices muscu
  for (const name of muscuExercises) {
    await prisma.exercise.upsert({
      where: { id: `ex-muscu-${muscuExercises.indexOf(name) + 1}` },
      update: {},
      create: {
        id: `ex-muscu-${muscuExercises.indexOf(name) + 1}`,
        name,
        type: 'muscu',
        userId: null
      }
    });
  }

  console.log('✅ Seed completed!');
  console.log(`📊 Created ${cardioExercises.length} cardio exercises`);
  console.log(`📊 Created ${muscuExercises.length} muscu exercises`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
