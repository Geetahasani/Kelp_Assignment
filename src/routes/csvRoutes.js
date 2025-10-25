const express = require('express');
const { uploadCSV, previewCSV } = require('../controllers/csvController');
const router = express.Router();

// Route to preview CSV data without uploading
router.get('/preview', previewCSV);

// Route to trigger the CSV processing and upload
router.post('/upload', uploadCSV);

module.exports = router;