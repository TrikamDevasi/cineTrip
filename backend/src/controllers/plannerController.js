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
      concessions,
      concessionTotal,
      passType,
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
      concessions: concessions || [],
      concessionTotal: concessionTotal || 0,
      tripVersion: 1,
      passType: passType || 'cinetrip_pass',
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
    const allowed = [
      'movie',
      'cinema',
      'date',
      'time',
      'slotName',
      'friends',
      'notes',
      'seats',
      'snacks',
      'concessions',
      'concessionTotal',
      'status',
      'bookingStatus',
      'bookingRef',
      'showtimeId',
      'ticketingConnected',
    ];
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

    // Increment version on update to invalidate tampered/stale cached passes
    const plan = await Plan.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { $set: changes, $inc: { tripVersion: 1 } },
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

// POST /api/plans/verify-pass
// Verifies QR code payloads from CineTrip Passes
const verifyPass = async (req, res, next) => {
  try {
    const { tripId, userId, tripVersion } = req.body;
    if (!tripId) {
      return res.status(400).json({
        valid: false,
        status: 'invalid_payload',
        message: 'Missing tripId in QR code payload.',
      });
    }

    const plan = await Plan.findById(tripId).populate('user', 'name email').lean();
    if (!plan) {
      return res.status(404).json({
        valid: false,
        status: 'not_found',
        message: 'Trip pass not found or has been deleted.',
      });
    }

    if (plan.status === 'cancelled') {
      return res.status(200).json({
        valid: false,
        status: 'cancelled',
        message: 'This movie night was cancelled.',
        plan: {
          _id: plan._id,
          movie: plan.movie,
          status: plan.status,
        },
      });
    }

    // Verify trip ownership if userId is included in pass payload
    if (userId && String(plan.user._id || plan.user) !== String(userId)) {
      return res.status(200).json({
        valid: false,
        status: 'tampered',
        message: 'Pass creator ID does not match database record.',
      });
    }

    // Version verification (tamper / stale check)
    const currentVersion = plan.tripVersion || 1;
    const passVersion = Number(tripVersion) || 1;
    const isOutdated = passVersion < currentVersion;

    return res.status(200).json({
      valid: true,
      status: isOutdated ? 'stale_version' : 'valid',
      message: isOutdated
        ? `Pass details are outdated (v${passVersion} vs active v${currentVersion}). Latest details loaded.`
        : 'Valid CineTrip Pass.',
      data: {
        _id: plan._id,
        movie: plan.movie,
        cinema: plan.cinema,
        date: plan.date,
        time: plan.time,
        seats: plan.seats,
        concessions: plan.concessions,
        concessionTotal: plan.concessionTotal,
        friends: plan.friends,
        status: plan.status,
        passType: plan.passType || 'cinetrip_pass',
        tripVersion: currentVersion,
        organizer: plan.user?.name || 'CineTrip Organizer',
      },
    });
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

// GET /api/plans/public/:id
// Unauthenticated read-only preview for invited friends
const getPublicPlanById = async (req, res, next) => {
  try {
    const plan = await Plan.findById(req.params.id).lean();
    if (!plan) {
      return res.status(404).json({ message: 'Movie night outing not found.' });
    }

    // Sanitize: strictly return public outing details, no user private info
    const publicData = {
      _id: plan._id,
      movie: plan.movie,
      cinema: plan.cinema,
      date: plan.date,
      time: plan.time,
      slotName: plan.slotName,
      seats: plan.seats,
      snacks: plan.snacks,
      friends: (plan.friends || []).map((f) => ({
        name: f.name,
        status: f.status || 'invited',
        handle: f.handle || '',
      })),
      bookingStatus: plan.bookingStatus,
      bookingRef: plan.bookingRef || `CT-PASS-${plan.movie?.id || ''}`,
      createdAt: plan.createdAt,
    };

    res.json({ data: publicData });
  } catch (error) {
    next(error);
  }
};

// POST /api/plans/public/:id/rsvp
// Unauthenticated guest RSVP submission
const rsvpPublicPlan = async (req, res, next) => {
  try {
    const { name, status = 'confirmed', handle = '' } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Name is required to RSVP.' });
    }

    const trimmedName = name.trim().slice(0, 50);
    const validStatus = ['confirmed', 'maybe', 'declined'].includes(status) ? status : 'confirmed';

    const plan = await Plan.findById(req.params.id);
    if (!plan) {
      return res.status(404).json({ message: 'Movie night outing not found.' });
    }

    const friendsList = plan.friends || [];
    const existingIndex = friendsList.findIndex(
      (f) => f.name && f.name.toLowerCase() === trimmedName.toLowerCase()
    );

    if (existingIndex >= 0) {
      friendsList[existingIndex].status = validStatus;
      if (handle) friendsList[existingIndex].handle = handle.trim().slice(0, 30);
    } else {
      friendsList.push({
        name: trimmedName,
        status: validStatus,
        handle: handle ? handle.trim().slice(0, 30) : `@${trimmedName.toLowerCase().replace(/\s+/g, '')}`,
      });
    }

    plan.friends = friendsList;
    await plan.save();

    res.json({
      message: `RSVP recorded for ${trimmedName}.`,
      data: {
        friends: plan.friends,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPlans,
  getPlanById,
  getPublicPlanById,
  rsvpPublicPlan,
  createPlan,
  updatePlan,
  deletePlan,
  verifyPass,
};

