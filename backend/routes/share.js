const express = require('express');
const { verifyToken } = require('./auth');
const router = express.Router();

// Share report
router.post('/', verifyToken, (req, res) => {
  const { report_id, shared_with_email, access_type } = req.body;
  const db = req.app.get('db');
  const userId = req.user.id;

  if (!report_id || !shared_with_email) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Check if report belongs to user
  db.get('SELECT * FROM reports WHERE id = ? AND user_id = ?', [report_id, userId], (err, report) => {
    if (err) return res.status(500).json({ error: 'Error checking report ownership' });
    if (!report) return res.status(404).json({ error: 'Report not found or not owned by user' });

    // Get shared user id
    db.get('SELECT id FROM users WHERE email = ?', [shared_with_email], (err, user) => {
      if (err) return res.status(500).json({ error: 'Error finding user' });
      if (!user) return res.status(404).json({ error: 'User not found' });

      // Check if already shared
      db.get('SELECT * FROM shared_access WHERE report_id = ? AND shared_with_user_id = ?', [report_id, user.id], (err, existing) => {
        if (err) return res.status(500).json({ error: 'Error checking existing share' });
        if (existing) return res.status(400).json({ error: 'Report already shared with this user' });

        // Share report
        db.run('INSERT INTO shared_access (report_id, shared_with_user_id, access_type) VALUES (?, ?, ?)',
          [report_id, user.id, access_type || 'read'], function(err) {
          if (err) return res.status(500).json({ error: 'Error sharing report' });
          res.status(201).json({ message: 'Report shared successfully' });
        });
      });
    });
  });
});

// Get shared reports for user
router.get('/shared-with-me', verifyToken, (req, res) => {
  const db = req.app.get('db');
  const userId = req.user.id;

  db.all(`
    SELECT sa.*, r.filename, r.original_name, r.report_type, r.date, u.username as owner_username
    FROM shared_access sa
    JOIN reports r ON sa.report_id = r.id
    JOIN users u ON r.user_id = u.id
    WHERE sa.shared_with_user_id = ?
  `, [userId], (err, sharedReports) => {
    if (err) return res.status(500).json({ error: 'Error fetching shared reports' });
    res.json(sharedReports);
  });
});

// Revoke share
router.delete('/:id', verifyToken, (req, res) => {
  const db = req.app.get('db');
  const userId = req.user.id;
  const shareId = req.params.id;

  // Check if user owns the report being shared
  db.get(`
    SELECT sa.* FROM shared_access sa
    JOIN reports r ON sa.report_id = r.id
    WHERE sa.id = ? AND r.user_id = ?
  `, [shareId, userId], (err, share) => {
    if (err) return res.status(500).json({ error: 'Error checking share ownership' });
    if (!share) return res.status(404).json({ error: 'Share not found or not owned by user' });

    db.run('DELETE FROM shared_access WHERE id = ?', [shareId], function(err) {
      if (err) return res.status(500).json({ error: 'Error revoking share' });
      res.json({ message: 'Share revoked successfully' });
    });
  });
});

module.exports = router;
