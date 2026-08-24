import React from 'react';
  
  const Auth = () =>  {
	return (
	  <div>
	  </div>
	);
  }
  
  export default Auth;
  const express = require('express');
const router = express.Router();
const { register, login, getMe } = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');
const {
  registerSchema,
  loginSchema,
  validate,
} = require('../validators/authValidators');

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.get('/me', authenticateToken, getMe);

module.exports = router;
