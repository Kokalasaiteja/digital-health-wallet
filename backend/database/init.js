const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');

function initializeDatabase(dbPath) {
  return new Promise((resolve, reject) => {
    // For Render deployments, always start with a fresh database to avoid corruption issues
    const fs = require('fs');

    if (fs.existsSync(dbPath)) {
      console.log('Removing existing database file for fresh start...');
      try {
        fs.unlinkSync(dbPath);
        console.log('Existing database file removed');
      } catch (unlinkErr) {
        console.error('Error removing existing database file:', unlinkErr.message);
        // Continue anyway, might still work
      }
    }

    // Always create fresh database
    createFreshDatabase(dbPath, resolve, reject);
  });
}

function createFreshDatabase(dbPath, resolve, reject) {
  console.log('Creating fresh SQLite database at', dbPath);
  const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
      console.error('Failed to create new SQLite DB:', err.message);
      reject(err);
      return;
    }
    console.log('New SQLite DB created at', dbPath);
    initializeTables(db, resolve, reject);
  });
}

function initializeTables(db, resolve, reject) {
  db.serialize(() => {
    // Create tables
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT DEFAULT 'owner'
      )
    `, (err) => {
      if (err) {
        console.error('Error creating users table:', err);
        reject(err);
        return;
      }
    });

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
    `, (err) => {
      if (err) {
        console.error('Error creating reports table:', err);
        reject(err);
        return;
      }
    });

    db.run(`
      CREATE TABLE IF NOT EXISTS vitals (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        vital_type TEXT NOT NULL,
        value TEXT NOT NULL,
        date TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `, (err) => {
      if (err) {
        console.error('Error creating vitals table:', err);
        reject(err);
        return;
      }
    });

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
    `, (err) => {
      if (err) {
        console.error('Error creating shared_access table:', err);
        reject(err);
        return;
      }

      // Insert demo data
      insertDemoData(db);
      resolve(db);
    });
  });
}

function insertDemoData(db) {
  // Hash the password for demo user
  const demoPassword = 'password';
  bcrypt.hash(demoPassword, 10, (err, hashedPassword) => {
    if (err) {
      console.error('Error hashing demo password:', err);
      return;
    }

    db.run(`
      INSERT OR IGNORE INTO users (username, email, password, role)
      VALUES (?, ?, ?, ?)
    `, ['demo_user', 'demo@example.com', hashedPassword, 'owner'], function(err) {
      if (err) {
        console.error('Error inserting demo user:', err);
        return;
      }
      console.log('Demo user inserted (or exists already)');

      const demoUserId = this.lastID || 1;

      // Insert demo report
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

      // Insert demo vitals
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
}

module.exports = { initializeDatabase };
