const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    passwordHash: {
      type: String,
      required: false, // Optional: Google OAuth users have no password
      select: false,
    },
    // OAuth provider linkage
    googleId: {
      type: String,
      default: null,
      index: true,
      sparse: true,
    },
    provider: {
      type: String,
      enum: ['local', 'google'],
      default: 'local',
    },
    resetPasswordToken: {
      type: String,
      default: null,
      select: false,
    },
    resetPasswordExpires: {
      type: Date,
      default: null,
      select: false,
    },
    avatar: {
      type: String,
      default: null,
    },
    profile: {
      city: { type: String, default: '' },
      avatar: { type: String, default: '🍿' },
      preferredFormat: { type: String, default: 'IMAX Laser' },
      preferredChain: { type: String, default: '' },
      favoriteGenres: { type: [String], default: [] },
      notificationsEnabled: { type: Boolean, default: true },
      autoExportCalendar: { type: Boolean, default: false },
      themeMode: { type: String, enum: ['dark', 'light', 'system'], default: 'dark' },
    },
  },
  { timestamps: true }
);

// Hash password before saving (only if passwordHash is set and modified)
userSchema.pre('save', async function (next) {
  if (!this.isModified('passwordHash') || !this.passwordHash) return next();
  this.passwordHash = await bcrypt.hash(this.passwordHash, 12);
  next();
});

// Compare password (safe for OAuth accounts)
userSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.passwordHash) return false;
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

// Remove sensitive fields from JSON output
userSchema.methods.toSafeObject = function () {
  const obj = this.toObject();
  delete obj.passwordHash;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
