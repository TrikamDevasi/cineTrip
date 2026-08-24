import React from 'react';
  
  const Planner = () =>  {
	return (
	  <div>
	  </div>
	);
  }
  
  export default Planner;
  const express = require('express');
const router = express.Router();
const {
  getPlans,
  getPlanById,
  createPlan,
  updatePlan,
  deletePlan,
} = require('../controllers/plannerController');
const { authenticateToken } = require('../middleware/auth');
const { createPlanSchema, updatePlanSchema, validate } = require('../validators/planValidators');

router.use(authenticateToken);

router.get('/', getPlans);
router.get('/:id', getPlanById);
router.post('/', validate(createPlanSchema), createPlan);
router.put('/:id', validate(updatePlanSchema), updatePlan);
router.delete('/:id', deletePlan);

module.exports = router;
