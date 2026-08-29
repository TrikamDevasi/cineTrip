const express = require('express');
const router = express.Router();
const { register, login, getMe } = require('../controllers/authController');
const { googleAuth } = require('../controllers/googleAuthController');
const { authenticateToken } = require('../middleware/auth');
const {
  registerSchema,
  loginSchema,
  validate,
} = require('../validators/authValidators');

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.post('/google', googleAuth);          // ← Google OAuth endpoint
router.get('/me', authenticateToken, getMe);

module.exports = router;
