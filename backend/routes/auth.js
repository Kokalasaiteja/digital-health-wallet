const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();

// JWT secret key
const JWT_SECRET = 'your_jwt_secret_key_here'; // In production, use environment variable

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Access denied' });

  try {
    const verified = jwt.verify(token, JWT_SECRET);
    req.user = verified;
    next();
  } catch (err) {
    res.status(400).json({ error: 'Invalid token' });
  }
};

// Register user
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;
  const db = req.app.get('db');

  if (!username || !email || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    // Check if user already exists
    db.get('SELECT * FROM users WHERE email = ? OR username = ?', [email, username], (err, user) => {
      if (err) return res.status(500).json({ error: 'Database error' });
      if (user) return res.status(400).json({ error: 'User already exists' });

      // Hash password
      bcrypt.hash(password, 10, (err, hashedPassword) => {
        if (err) return res.status(500).json({ error: 'Error hashing password' });

        // Insert user
        db.run('INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
          [username, email, hashedPassword], function(err) {
          if (err) return res.status(500).json({ error: 'Error creating user' });
          res.status(201).json({ message: 'User registered successfully', userId: this.lastID });
        });
      });
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Login user
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  const db = req.app.get('db');

  if (!email || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  db.get('SELECT * FROM users WHERE email = ?', [email], (err, user) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (!user) return res.status(400).json({ error: 'User not found' });

    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err) return res.status(500).json({ error: 'Error comparing passwords' });
      if (!isMatch) return res.status(400).json({ error: 'Invalid password' });

      // Create JWT token
      const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET);
      res.json({ token, user: { id: user.id, username: user.username, email: user.email } });
    });
  });
});

module.exports = router;
module.exports.verifyToken = verifyToken;
