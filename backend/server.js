const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');

const authRoutes = require('./routes/auth');
const reportRoutes = require('./routes/reports');
const vitalRoutes = require('./routes/vitals');
const shareRoutes = require('./routes/share');
const { initializeDatabase } = require('./database/init');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' })); // Add limit for file uploads
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// Ensure directories exist
const uploadsDir = process.env.NODE_ENV === 'production' ? '/data/uploads' : path.join(__dirname, 'uploads');
const dbDir = process.env.NODE_ENV === 'production' ? '/data/database' : path.join(__dirname, 'database');

[uploadsDir, dbDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`Directory created: ${dir}`);
  }
});

app.use('/uploads', express.static(uploadsDir));

// Initialize database
const db = initializeDatabase(path.join(dbDir, 'healthwallet.db'));
app.set('db', db);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/vitals', vitalRoutes);
app.use('/api/share', shareRoutes);

// Health check route
app.get('/', (req, res) => {
  res.json({
    message: 'Digital Health Wallet API is running',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      reports: '/api/reports',
      vitals: '/api/vitals',
      share: '/api/share'
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down gracefully...');
  db.close((err) => {
    if (err) {
      console.error('Error closing database:', err.message);
    } else {
      console.log('Database connection closed.');
    }
    process.exit(0);
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
