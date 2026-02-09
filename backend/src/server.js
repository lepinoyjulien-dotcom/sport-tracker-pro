const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Import all routes
const authRoutes = require('./routes/auth');
const cardioRoutes = require('./routes/cardio');
const muscuRoutes = require('./routes/muscu');
const weightRoutes = require('./routes/weight');
const exerciseRoutes = require('./routes/exercises');
const statsRoutes = require('./routes/stats');
const adminRoutes = require('./routes/admin');
const profileRoutes = require('./routes/profile');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/cardio', cardioRoutes);
app.use('/api/muscu', muscuRoutes);
app.use('/api/weight', weightRoutes);
app.use('/api/exercises', exerciseRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/profile', profileRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    routes: [
      '/api/auth',
      '/api/cardio',
      '/api/muscu',
      '/api/weight',
      '/api/exercises',
      '/api/stats',
      '/api/admin',
      '/api/profile'
    ]
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Sport Tracker Pro API',
    version: '2.0.0',
    features: ['multi-user', 'admin-panel', 'profile-management', 'date-selector'],
    endpoints: {
      auth: '/api/auth',
      cardio: '/api/cardio',
      muscu: '/api/muscu',
      weight: '/api/weight',
      exercises: '/api/exercises',
      stats: '/api/stats',
      admin: '/api/admin (requires admin role)',
      profile: '/api/profile (requires auth)'
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: err.message 
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    path: req.path
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log('===========================================');
  console.log(`🚀 Server running on port ${PORT}`);
  console.log('===========================================');
  console.log('📋 Available routes:');
  console.log('   - POST /api/auth/register');
  console.log('   - POST /api/auth/login');
  console.log('   - GET  /api/cardio');
  console.log('   - POST /api/cardio');
  console.log('   - GET  /api/muscu');
  console.log('   - POST /api/muscu');
  console.log('   - GET  /api/weight');
  console.log('   - POST /api/weight');
  console.log('   - GET  /api/stats');
  console.log('   - GET  /api/admin/users (admin only)');
  console.log('   - POST /api/admin/reset-password (admin only)');
  console.log('   - GET  /api/profile');
  console.log('   - PUT  /api/profile');
  console.log('===========================================');
  console.log('✅ Sport Tracker Pro ULTRA is ready!');
  console.log('===========================================');
});

module.exports = app;
