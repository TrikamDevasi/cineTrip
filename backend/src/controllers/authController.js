import React from 'react';
  
  const AuthController = () =>  {
	return (
	  <div>
	  </div>
	);
  }
  
  export default AuthController;
  const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// POST /api/auth/register
const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'An account with this email already exists.' });
    }

    // Create user (passwordHash will be hashed by pre-save hook)
    const user = new User({
      name,
      email,
      passwordHash: password, // pre-save hook hashes this
    });
    await user.save();

    const token = generateToken(user._id);

    res.status(201).json({
      message: 'Account created successfully.',
      token,
      user: user.toSafeObject(),
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Get user including passwordHash
    const user = await User.findOne({ email }).select('+passwordHash');
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const token = generateToken(user._id);

    // Return user without passwordHash
    const userObj = user.toObject();
    delete userObj.passwordHash;

    res.json({
      message: 'Login successful.',
      token,
      user: userObj,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/auth/me
const getMe = async (req, res) => {
  // req.user is set by authenticateToken middleware
  res.json({ user: req.user });
};

module.exports = { register, login, getMe };
