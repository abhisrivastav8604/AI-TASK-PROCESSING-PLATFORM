const mongoose = require('mongoose');

const OPERATIONS = ['uppercase', 'lowercase', 'reverse', 'word_count'];

const STATUSES = ['pending', 'running', 'success', 'failed'];

const taskSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'userId is required'],
      index: true,
    },

    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
      minlength: [1, 'Title must not be empty'],
      maxlength: [200, 'Title must not exceed 200 characters'],
    },

    inputText: {
      type: String,
      required: [true, 'Input text is required'],
      maxlength: [50000, 'Input text must not exceed 50,000 characters'],
    },

    operation: {
      type: String,
      enum: {
        values: OPERATIONS,
        message: `Operation must be one of: ${OPERATIONS.join(', ')}`,
      },
      required: [true, 'Operation is required'],
    },

    status: {
      type: String,
      enum: {
        values: STATUSES,
        message: `Status must be one of: ${STATUSES.join(', ')}`,
      },
      default: 'pending',
    },

    result: {
      type: String,
      default: null,
    },

    logs: {
      type: [String],
      default: [],
    },

    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        delete ret.__v;
        return ret;
      },
    },
  },
);

taskSchema.index({ userId: 1, createdAt: -1 });

taskSchema.index({ status: 1 });

taskSchema.index({ deletedAt: 1 });

taskSchema.statics.OPERATIONS = OPERATIONS;
taskSchema.statics.STATUSES = STATUSES;

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;
