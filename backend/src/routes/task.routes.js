const express = require('express');
const { body, param, query } = require('express-validator');
const { protect } = require('../middleware/auth.middleware');
const {
  createTask,
  listTasks,
  getTask,
  deleteTask,
} = require('../controllers/task.controller');
const Task = require('../models/Task.model');

const router = express.Router();

router.use(protect);

const createTaskValidation = [
  body('title')
    .trim()
    .notEmpty().withMessage('Title is required')
    .isLength({ min: 1, max: 200 })
    .withMessage('Title must be 1–200 characters'),
  body('inputText')
    .notEmpty().withMessage('Input text is required')
    .isLength({ max: 50000 })
    .withMessage('Input text must not exceed 50,000 characters'),
  body('operation')
    .notEmpty().withMessage('Operation is required')
    .isIn(Task.OPERATIONS)
    .withMessage(`Operation must be one of: ${Task.OPERATIONS.join(', ')}`),
];

const idValidation = [
  param('id').isMongoId().withMessage('Invalid task ID format'),
];

const listQueryValidation = [
  query('page').optional().isInt({ min: 1 }).withMessage('page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('limit must be 1–100'),
];

router.post('/', createTaskValidation, createTask);
router.get('/', listQueryValidation, listTasks);
router.get('/:id', idValidation, getTask);
router.delete('/:id', idValidation, deleteTask);

module.exports = router;
