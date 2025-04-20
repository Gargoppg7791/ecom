const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/upload.controller');
const { authenticate } = require('../middleware/authenticat.js');

// Upload route
router.post('/', authenticate, uploadController.uploadFile);

module.exports = router; 