import React from 'react';
  
  const MemoriesController = () =>  {
	return (
	  <div>
	  </div>
	);
  }
  
  export default MemoriesController;
  const Memory = require('../models/Memory');

// GET /api/memories
const getMemories = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const [memories, total] = await Promise.all([
      Memory.find({ user: req.user._id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Memory.countDocuments({ user: req.user._id }),
    ]);

    res.json({
      data: memories,
      page,
      limit,
      total,
      hasNextPage: skip + memories.length < total,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/memories/:id
const getMemoryById = async (req, res, next) => {
  try {
    const memory = await Memory.findOne({ _id: req.params.id, user: req.user._id });
    if (!memory) {
      return res.status(404).json({ message: 'Memory not found.' });
    }
    res.json({ data: memory });
  } catch (error) {
    next(error);
  }
};

// POST /api/memories
const createMemory = async (req, res, next) => {
  try {
    const memory = new Memory({
      user: req.user._id,
      ...req.body,
    });
    await memory.save();
    res.status(201).json({ message: 'Memory saved.', data: memory });
  } catch (error) {
    next(error);
  }
};

// PUT /api/memories/:id
const updateMemory = async (req, res, next) => {
  try {
    const memory = await Memory.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!memory) {
      return res.status(404).json({ message: 'Memory not found.' });
    }
    res.json({ message: 'Memory updated.', data: memory });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/memories/:id
const deleteMemory = async (req, res, next) => {
  try {
    const memory = await Memory.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!memory) {
      return res.status(404).json({ message: 'Memory not found.' });
    }
    res.json({ message: 'Memory deleted.' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getMemories, getMemoryById, createMemory, updateMemory, deleteMemory };
