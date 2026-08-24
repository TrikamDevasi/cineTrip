const Plan = require('../models/Plan');

// GET /api/plans
const getPlans = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const [plans, total] = await Promise.all([
      Plan.find({ user: req.user._id })
        .sort({ date: 1, time: 1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Plan.countDocuments({ user: req.user._id }),
    ]);

    res.json({
      data: plans,
      page,
      limit,
      total,
      hasNextPage: skip + plans.length < total,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/plans/:id
const getPlanById = async (req, res, next) => {
  try {
    const plan = await Plan.findOne({ _id: req.params.id, user: req.user._id });
    if (!plan) {
      return res.status(404).json({ message: 'Plan not found.' });
    }
    res.json({ data: plan });
  } catch (error) {
    next(error);
  }
};

// POST /api/plans
const createPlan = async (req, res, next) => {
  try {
    const plan = new Plan({
      user: req.user._id,
      ...req.body,
    });
    await plan.save();
    res.status(201).json({ message: 'Plan created.', data: plan });
  } catch (error) {
    next(error);
  }
};

// PUT /api/plans/:id
const updatePlan = async (req, res, next) => {
  try {
    const plan = await Plan.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!plan) {
      return res.status(404).json({ message: 'Plan not found.' });
    }
    res.json({ message: 'Plan updated.', data: plan });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/plans/:id
const deletePlan = async (req, res, next) => {
  try {
    const plan = await Plan.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!plan) {
      return res.status(404).json({ message: 'Plan not found.' });
    }
    res.json({ message: 'Plan deleted.' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getPlans, getPlanById, createPlan, updatePlan, deletePlan };
