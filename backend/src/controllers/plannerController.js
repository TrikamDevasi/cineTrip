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
    const {
      movie,
      cinema,
      date,
      time,
      slotName,
      showtimeId,
      friends,
      notes,
      seats,
      bookingStatus,
      bookingRef,
      snacks,
      status,
    } = req.body;

    if (!movie || !movie.id) {
      return res.status(400).json({ message: 'A verified movie id is required to create a plan.' });
    }

    // Until a real ticketing provider is connected the server cannot verify
    // bookings, references or showtimes — refusing unverifiable data.
    if (showtimeId && String(showtimeId).trim()) {
      return res.status(400).json({
        message:
          'Live showtimes are not connected yet, so a plan cannot reference a showtime.',
      });
    }
    if (bookingStatus && bookingStatus !== 'plan') {
      return res.status(400).json({
        message:
          "Only personal plans (status 'plan') can be saved until a ticketing provider is connected and bookings can be verified.",
      });
    }
    if (bookingRef && String(bookingRef).trim()) {
      return res.status(400).json({
        message:
          'Live booking references are not available yet — a ticketing provider must be connected first.',
      });
    }

    const plan = new Plan({
      user: req.user._id,
      movie,
      cinema,
      date,
      time: time || '',
      slotName: slotName || '',
      friends: friends || [],
      notes: notes || '',
      seats: seats || '',
      snacks: snacks || [],
      status: status || 'upcoming',
      bookingStatus: 'plan',
      bookingRef: '',
      showtimeId: '',
      ticketingConnected: false,
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
    const allowed = ['movie', 'cinema', 'date', 'time', 'slotName', 'friends', 'notes', 'seats', 'snacks', 'status', 'bookingStatus', 'bookingRef', 'showtimeId', 'ticketingConnected'];
    const changes = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) changes[key] = req.body[key];
    }

    if (changes.bookingStatus && changes.bookingStatus !== 'plan') {
      return res.status(400).json({
        message:
          "Only personal plans (status 'plan') can be saved until a ticketing provider is connected and bookings can be verified.",
      });
    }
    if (changes.showtimeId && String(changes.showtimeId).trim()) {
      return res.status(400).json({
        message: 'Live showtimes are not connected yet, so a plan cannot reference a showtime.',
      });
    }
    if (changes.bookingRef && String(changes.bookingRef).trim()) {
      return res.status(400).json({
        message: 'Live booking references are not available yet — a ticketing provider must be connected first.',
      });
    }
    if (changes.ticketingConnected === true) {
      return res.status(400).json({
        message: 'Ticketing is not connected for this plan — a ticketing provider must be configured first.',
      });
    }
    delete changes.ticketingConnected;

    const plan = await Plan.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { $set: changes },
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
