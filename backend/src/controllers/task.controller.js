const { validationResult } = require('express-validator');
const Task = require('../models/Task.model');
const { enqueueTask } = require('../utils/queue.utils');
const logger = require('../config/logger');

const createTask = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { title, inputText, operation } = req.body;

    const task = await Task.create({
      userId: req.user._id,
      title,
      inputText,
      operation,
      logs: [`Task created at ${new Date().toISOString()}`],
    });

    logger.info('Task created', { taskId: task._id, userId: req.user._id, operation });

    try {
      await enqueueTask(task._id.toString());
    } catch (queueErr) {
      logger.error('Failed to enqueue task — task remains pending', {
        taskId: task._id,
        error: queueErr.message,
      });
    }

    return res.status(201).json({ success: true, data: task });
  } catch (err) {
    return next(err);
  }
};

const listTasks = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 10));
    const skip = (page - 1) * limit;

    const filter = {
      userId: req.user._id,
      deletedAt: null,
    };

    const [tasks, total] = await Promise.all([
      Task.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('-logs')
        .lean(),
      Task.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      data: tasks,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    return next(err);
  }
};

const getTask = async (req, res, next) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      userId: req.user._id,
      deletedAt: null,
    });

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found.' });
    }

    return res.status(200).json({ success: true, data: task });
  } catch (err) {
    return next(err);
  }
};

const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findOneAndUpdate(
      {
        _id: req.params.id,
        userId: req.user._id,
        deletedAt: null,
      },
      {
        $set: { deletedAt: new Date() },
        $push: { logs: `Task deleted at ${new Date().toISOString()}` },
      },
      { new: true },
    );

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found.' });
    }

    logger.info('Task soft-deleted', { taskId: task._id, userId: req.user._id });

    return res.status(200).json({ success: true, message: 'Task deleted successfully.' });
  } catch (err) {
    return next(err);
  }
};

module.exports = {
  createTask, listTasks, getTask, deleteTask,
};
