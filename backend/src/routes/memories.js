const express = require('express');
const router = express.Router();
const {
  getMemories,
  getMemoryById,
  createMemory,
  updateMemory,
  deleteMemory,
} = require('../controllers/memoriesController');
const { authenticateToken } = require('../middleware/auth');
const { createMemorySchema, updateMemorySchema, validate } = require('../validators/memoryValidators');

router.use(authenticateToken);

router.get('/', getMemories);
router.get('/:id', getMemoryById);
router.post('/', validate(createMemorySchema), createMemory);
router.put('/:id', validate(updateMemorySchema), updateMemory);
router.delete('/:id', deleteMemory);

module.exports = router;
