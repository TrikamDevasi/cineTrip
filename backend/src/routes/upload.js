const express = require('express');
const router = express.Router();
const { signUpload } = require('../controllers/uploadController');
const { authenticateToken } = require('../middleware/auth');

// Media upload signature (authenticated — only logged-in users may upload media)
router.post('/sign', authenticateToken, signUpload);

module.exports = router;