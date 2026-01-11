const express = require('express');
const { verifyToken } = require('./auth');
const router = express.Router();

// Add vital
router.post('/', verifyToken, (req, res) => {
  const { vital_type, value, date } = req.body;
  const db = req.app.get('db');
  const userId = req.user.id;

  if (!vital_type || !value || !date) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  db.run('INSERT INTO vitals (user_id, vital_type, value, date) VALUES (?, ?, ?, ?)',
    [userId, vital_type, value, date], function(err) {
    if (err) return res.status(500).json({ error: 'Error saving vital' });
    res.status(201).json({ message: 'Vital added successfully', vitalId: this.lastID });
  });
});

// Get user's vitals
router.get('/', verifyToken, (req, res) => {
  const db = req.app.get('db');
  const userId = req.user.id;
  const { type, start_date, end_date } = req.query;

  let query = 'SELECT * FROM vitals WHERE user_id = ?';
  let params = [userId];

  if (type) {
    query += ' AND vital_type = ?';
    params.push(type);
  }

  if (start_date && end_date) {
    query += ' AND date BETWEEN ? AND ?';
    params.push(start_date, end_date);
  }

  query += ' ORDER BY date DESC';

  db.all(query, params, (err, vitals) => {
    if (err) return res.status(500).json({ error: 'Error fetching vitals' });
    res.json(vitals);
  });
});

// Update vital
router.put('/:id', verifyToken, (req, res) => {
  const { vital_type, value, date } = req.body;
  const db = req.app.get('db');
  const userId = req.user.id;
  const vitalId = req.params.id;

  db.run('UPDATE vitals SET vital_type = ?, value = ?, date = ? WHERE id = ? AND user_id = ?',
    [vital_type, value, date, vitalId, userId], function(err) {
    if (err) return res.status(500).json({ error: 'Error updating vital' });
    if (this.changes === 0) return res.status(404).json({ error: 'Vital not found' });
    res.json({ message: 'Vital updated successfully' });
  });
});

// Delete vital
router.delete('/:id', verifyToken, (req, res) => {
  const db = req.app.get('db');
  const userId = req.user.id;
  const vitalId = req.params.id;

  db.run('DELETE FROM vitals WHERE id = ? AND user_id = ?', [vitalId, userId], function(err) {
    if (err) return res.status(500).json({ error: 'Error deleting vital' });
    if (this.changes === 0) return res.status(404).json({ error: 'Vital not found' });
    res.json({ message: 'Vital deleted successfully' });
  });
});

module.exports = router;
