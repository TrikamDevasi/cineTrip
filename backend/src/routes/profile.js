const express = require('express');
const router = express.Router();
const { getProfile, updateProfile } = require('../controllers/profileController');
const { authenticateToken } = require('../middleware/auth');
const { updateProfileSchema, validate } = require('../validators/profileValidators');

router.use(authenticateToken);

router.get('/', getProfile);
router.put('/', validate(updateProfileSchema), updateProfile);

module.exports = router;
