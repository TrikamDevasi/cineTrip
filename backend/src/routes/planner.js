const express = require('express');
const router = express.Router();
const {
  getPlans,
  getPlanById,
  getPublicPlanById,
  rsvpPublicPlan,
  createPlan,
  updatePlan,
  deletePlan,
  verifyPass,
} = require('../controllers/plannerController');
const { authenticateToken } = require('../middleware/auth');
const { createPlanSchema, updatePlanSchema, validate } = require('../validators/planValidators');

// Public routes for invited squad members & turnstile pass verification
router.get('/public/:id', getPublicPlanById);
router.post('/public/:id/rsvp', rsvpPublicPlan);
router.post('/verify-pass', verifyPass);

// Protected routes requiring authentication
router.use(authenticateToken);

router.get('/', getPlans);
router.get('/:id', getPlanById);
router.post('/', validate(createPlanSchema), createPlan);
router.put('/:id', validate(updatePlanSchema), updatePlan);
router.delete('/:id', deletePlan);

module.exports = router;
