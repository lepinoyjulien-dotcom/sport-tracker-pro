// Script to create admin user
// backend/scripts/create-admin.js

const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createAdminUser() {
  try {
    console.log('🔐 Creating admin user...');

    // Check if admin already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: 'admin@sporttracker.com' }
    });

    if (existingAdmin) {
      console.log('✅ Admin user already exists');
      return;
    }

    // Hash password 'admin'
    const hashedPassword = await bcrypt.hash('admin', 10);

    // Create admin user
    const admin = await prisma.user.create({
      data: {
        email: 'admin@sporttracker.com',
        password: hashedPassword,
        name: 'Administrateur',
        weight: 75.0,
        role: 'admin'
      }
    });

    console.log('✅ Admin user created successfully!');
    console.log('   Email: admin@sporttracker.com');
    console.log('   Password: admin');
    console.log('   ⚠️  CHANGE THIS PASSWORD IN PRODUCTION!');

  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdminUser();
