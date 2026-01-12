const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const authRoutes = require('./routes/auth');
const reportRoutes = require('./routes/reports');
const vitalRoutes = require('./routes/vitals');
const shareRoutes = require('./routes/share');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('Uploads directory created at', uploadsDir);
}
app.use('/uploads', express.static(uploadsDir));

const dbDir = path.join(__dirname, 'database');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
  console.log('Database directory created at', dbDir);
}

const dbPath = path.join(dbDir, 'healthwallet.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Failed to connect to SQLite DB:', err.message);
  } else {
    console.log('Connected to SQLite DB at', dbPath);
  }
});

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT DEFAULT 'owner'
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS reports (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      filename TEXT NOT NULL,
      original_name TEXT NOT NULL,
      report_type TEXT,
      date TEXT,
      vitals TEXT,
      uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS vitals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      vital_type TEXT NOT NULL,
      value REAL NOT NULL,
      date TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS shared_access (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      report_id INTEGER NOT NULL,
      shared_with_user_id INTEGER NOT NULL,
      access_type TEXT DEFAULT 'read',
      shared_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (report_id) REFERENCES reports(id),
      FOREIGN KEY (shared_with_user_id) REFERENCES users(id)
    )
  `);

  db.run(`
    INSERT OR IGNORE INTO users (username, email, password, role)
    VALUES (?, ?, ?, ?)
  `, ['demo_user', 'demo@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'owner'], function(err) {
    if (err) {
      console.error('Error inserting demo user:', err);
      return;
    }
    console.log('Demo user inserted (or exists already)');

    const demoUserId = this.lastID || 1; // fallback if already exists

    db.run(`
      INSERT OR IGNORE INTO reports (user_id, filename, original_name, report_type, date, vitals)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [
      demoUserId,
      'sample_prescription.pdf',
      'Sample Prescription.pdf',
      'Prescription',
      '2024-01-15',
      'Blood Pressure: 120/80'
    ], (err) => {
      if (err) console.error('Error inserting demo report:', err);
      else console.log('Demo report inserted');
    });

    // Insert multiple demo vitals
    const demoVitals = [
      ['Blood Pressure', 120, '2024-01-15'],
      ['Heart Rate', 72, '2024-01-15'],
      ['Blood Sugar', 90, '2024-01-15'],
      ['Weight', 70, '2024-01-15'],
      ['Temperature', 98.6, '2024-01-15'],
      ['Blood Pressure', 118, '2024-01-16'],
      ['Heart Rate', 75, '2024-01-16'],
      ['Blood Sugar', 95, '2024-01-16'],
      ['Weight', 70.5, '2024-01-16'],
      ['Temperature', 98.4, '2024-01-16']
    ];

    demoVitals.forEach(vital => {
      db.run(`
        INSERT OR IGNORE INTO vitals (user_id, vital_type, value, date)
        VALUES (?, ?, ?, ?)
      `, [demoUserId, ...vital], (err) => {
        if (err) console.error('Error inserting demo vital:', err);
        else console.log(`Demo vital ${vital[0]} inserted`);
      });
    });
  });
});

app.set('db', db);

app.use('/api/auth', authRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/vitals', vitalRoutes);
app.use('/api/share', shareRoutes);

// Root route to handle GET /
app.get('/', (req, res) => {
  res.json({ message: 'Digital Health Wallet API is running. Please use the frontend application to interact with the API.' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
