const crypto = require('crypto');
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

// POST /api/auth/forgot-password
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    // Find user (must not leak whether an account exists)
    const user = await User.findOne({ email });

    if (user) {
      const resetToken = crypto.randomBytes(32).toString('hex');
      user.resetPasswordToken = resetToken;
      user.resetPasswordExpires = Date.now() + 60 * 60 * 1000; // 1 hour
      await user.save();

      // DEMO MODE: no email service is wired up, so return the token so the
      // client can construct the reset link directly.
      return res.json({
        message: 'If an account exists for that email, a reset link has been sent.',
        resetToken,
      });
    }

    // Generic response regardless of whether the user exists (anti-enumeration)
    res.json({
      message: 'If an account exists for that email, a reset link has been sent.',
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/auth/reset-password
const resetPassword = async (req, res, next) => {
  try {
    const { token, email, password } = req.body;

    const user = await User.findOne({ email, resetPasswordToken: token }).select(
      '+resetPasswordToken +resetPasswordExpires'
    );

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset link.' });
    }

    if (!user.resetPasswordExpires || user.resetPasswordExpires < Date.now()) {
      return res.status(400).json({
        message: 'This reset link has expired. Please request a new one.',
      });
    }

    // pre-save hook hashes the new password (passwordHash is modified)
    user.passwordHash = password;
    user.provider = 'local';
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    // Optional auto-login: return a JWT so the client can sign in immediately
    const authToken = generateToken(user._id);

    res.json({
      message: 'Password reset successful.',
      token: authToken,
      user: user.toSafeObject(),
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, getMe, forgotPassword, resetPassword };
