import React from 'react';
  
  const ProfileController = () =>  {
	return (
	  <div>
	  </div>
	);
  }
  
  export default ProfileController;
  const User = require('../models/User');

// GET /api/profile
const getProfile = async (req, res) => {
  res.json({ data: req.user });
};

// PUT /api/profile
const updateProfile = async (req, res, next) => {
  try {
    const { name, profile } = req.body;

    const updateData = {};
    if (name) updateData.name = name;
    if (profile) {
      // Merge profile sub-fields
      Object.keys(profile).forEach((key) => {
        updateData[`profile.${key}`] = profile[key];
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.json({ message: 'Profile updated.', data: updatedUser.toSafeObject() });
  } catch (error) {
    next(error);
  }
};

module.exports = { getProfile, updateProfile };
