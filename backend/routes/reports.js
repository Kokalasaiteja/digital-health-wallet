const express = require('express');
const multer = require('multer');
const path = require('path');
const { verifyToken } = require('../middleware/auth');
const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = process.env.NODE_ENV === 'production' ? '/data/uploads' : path.join(__dirname, '../uploads');
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// Upload report
router.post('/upload', verifyToken, upload.single('file'), function(req, res) {
  const { report_type, date, vitals } = req.body;
  const db = req.app.get('db');
  const userId = req.user.id;

  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

  db.run('INSERT INTO reports (user_id, filename, original_name, report_type, date, vitals) VALUES (?, ?, ?, ?, ?, ?)',
    [userId, req.file.filename, req.file.originalname, report_type, date, vitals], function(err) {
    if (err) return res.status(500).json({ error: 'Error saving report' });
    res.status(201).json({ message: 'Report uploaded successfully', reportId: this.lastID });
  });
});

// Get user's reports
router.get('/', verifyToken, (req, res) => {
  const db = req.app.get('db');
  const userId = req.user.id;

  db.all('SELECT * FROM reports WHERE user_id = ?', [userId], (err, reports) => {
    if (err) return res.status(500).json({ error: 'Error fetching reports' });
    res.json(reports);
  });
});

// Get shared reports
router.get('/shared', verifyToken, (req, res) => {
  const db = req.app.get('db');
  const userId = req.user.id;

  db.all(`
    SELECT r.* FROM reports r
    JOIN shared_access sa ON r.id = sa.report_id
    WHERE sa.shared_with_user_id = ?
  `, [userId], (err, reports) => {
    if (err) return res.status(500).json({ error: 'Error fetching shared reports' });
    res.json(reports);
  });
});

// Download report
router.get('/:id/download', verifyToken, (req, res) => {
  const db = req.app.get('db');
  const userId = req.user.id;
  const reportId = req.params.id;

  db.get('SELECT * FROM reports WHERE id = ? AND (user_id = ? OR id IN (SELECT report_id FROM shared_access WHERE shared_with_user_id = ?))',
    [reportId, userId, userId], (err, report) => {
    if (err) return res.status(500).json({ error: 'Error fetching report' });
    if (!report) return res.status(404).json({ error: 'Report not found' });

    const filePath = process.env.NODE_ENV === 'production' ? path.join('/data/uploads', report.filename) : path.join(__dirname, '../uploads', report.filename);
    res.download(filePath, report.original_name);
  });
});

module.exports = router;
