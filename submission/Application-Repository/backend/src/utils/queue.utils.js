const { Queue } = require('bullmq');
const { createRedisClient } = require('../config/redis');
const logger = require('../config/logger');

const QUEUE_NAME = 'task-queue';

let taskQueue = null;

const getTaskQueue = () => {
  if (!taskQueue) {
    const connection = createRedisClient();
    taskQueue = new Queue(QUEUE_NAME, {
      connection,
      defaultJobOptions: {
        attempts: 3,
        backoff: { type: 'exponential', delay: 1000 },
        removeOnComplete: { count: 1000 },
        removeOnFail: { count: 500 },
      },
    });

    taskQueue.on('error', (err) => {
      logger.error('BullMQ Queue error', { error: err.message });
    });

    logger.info(`BullMQ Queue "${QUEUE_NAME}" initialised`);
  }

  return taskQueue;
};

const enqueueTask = async (taskId) => {
  const queue = getTaskQueue();
  const job = await queue.add(
    'process-task',
    { taskId },
    { jobId: taskId },
  );
  logger.info('Task enqueued', { taskId, jobId: job.id });
  return job;
};

module.exports = { enqueueTask, getTaskQueue, QUEUE_NAME };
