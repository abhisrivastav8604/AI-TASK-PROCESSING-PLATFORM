"""
worker.py — Main entry point for the AI Task Processing Worker.

Architecture
------------
- Connects to Redis using redis-py.
- Listens on the BullMQ-compatible "task-queue" stream.
- On each job, delegates to processor.process_task(task_id).
- Supports running as multiple stateless replicas (no shared in-process state).
- Uses exponential backoff to reconnect to Redis on failure.

BullMQ Queue Protocol (simplified)
-----------------------------------
BullMQ stores jobs as Redis hashes under keys like:
    bull:{queue-name}:{job-id}
and uses a sorted set for the wait list:
    bull:{queue-name}:wait

This worker uses BRPOPLPUSH (Redis < 6.2) / LMOVE (Redis >= 6.2) semantics
via the official `bullmq` Python-compatible approach: we use redis-py's
blocking list pop on the "wait" list, then process the job.

For production scenarios, prefer the `bullmq` Python package or rq if a
pure-Python BullMQ client is required. Here we implement direct redis-py
polling that is compatible with jobs enqueued by the Node BullMQ backend.
"""

import json
import os
import signal
import sys
import time
from typing import Optional

import redis
from redis.exceptions import ConnectionError as RedisConnectionError, RedisError

from db import get_db  # noqa: F401  — eager connect on startup
from logger import get_logger
from processor import process_task

log = get_logger("worker.main")


REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379")
QUEUE_NAME: str = "task-queue"

BULL_WAIT_KEY: str = f"bull:{QUEUE_NAME}:wait"
BULL_ACTIVE_KEY: str = f"bull:{QUEUE_NAME}:active"
BULL_COMPLETED_KEY: str = f"bull:{QUEUE_NAME}:completed"
BULL_FAILED_KEY: str = f"bull:{QUEUE_NAME}:failed"

BPOP_TIMEOUT: int = 5

BACKOFF_BASE: float = 1.0
BACKOFF_MAX: float = 30.0


_running: bool = True


def _handle_signal(signum: int, _frame) -> None:  # noqa: ANN001
    """Handle SIGTERM / SIGINT — allow current job to finish, then exit."""
    global _running  # noqa: PLW0603
    log.info("Shutdown signal received, finishing current job...", extra={"signal": signum})
    _running = False


signal.signal(signal.SIGTERM, _handle_signal)
signal.signal(signal.SIGINT, _handle_signal)



def _create_redis_client(
    max_retries: int = 10,
    base_delay: float = BACKOFF_BASE,
    max_delay: float = BACKOFF_MAX,
) -> redis.Redis:
    """
    Create a redis-py client with exponential backoff retry.

    Returns:
        A connected :class:`redis.Redis` instance.

    Raises:
        SystemExit: If all retries are exhausted.
    """
    attempt = 0
    delay = base_delay

    while attempt < max_retries:
        try:
            client = redis.from_url(
                REDIS_URL,
                decode_responses=True,   # return str, not bytes
                socket_connect_timeout=5,
                socket_timeout=10,
                retry_on_timeout=True,
                health_check_interval=30,
            )
            client.ping()
            log.info("Redis connected", extra={"url": REDIS_URL})
            return client

        except (RedisConnectionError, RedisError) as exc:
            attempt += 1
            remaining = max_retries - attempt
            log.warning(
                "Redis connection failed",
                extra={
                    "error": str(exc),
                    "attempt": attempt,
                    "retries_remaining": remaining,
                    "retry_in_seconds": delay,
                },
            )
            if remaining == 0:
                log.error("All Redis connection attempts exhausted. Exiting.")
                sys.exit(1)

            time.sleep(delay)
            delay = min(delay * 2, max_delay)

    sys.exit(1)  # unreachable



def _get_job_data(client: redis.Redis, job_id: str) -> Optional[dict]:
    """
    Retrieve the job payload from the BullMQ Redis hash.

    BullMQ stores each job as a hash at:  bull:{queue}:{jobId}
    The hash field 'data' contains the JSON-serialised job payload.

    Args:
        client: Connected redis-py client.
        job_id: The BullMQ job ID (also the task MongoDB ObjectId).

    Returns:
        Parsed job data dict, or None if the hash doesn't exist.
    """
    job_key = f"bull:{QUEUE_NAME}:{job_id}"
    raw_data = client.hget(job_key, "data")
    if raw_data is None:
        log.warning("Job hash not found in Redis", extra={"job_key": job_key})
        return None
    try:
        return json.loads(raw_data)
    except json.JSONDecodeError as exc:
        log.error("Failed to parse job data", extra={"job_id": job_id, "error": str(exc)})
        return None


def _ack_job(client: redis.Redis, job_id: str) -> None:
    """
    Remove the job from the active list and mark it completed in Redis.
    This is a simplified acknowledgement — in production use the full
    BullMQ state machine (moveToCompleted / moveToFailed).
    """
    client.lrem(BULL_ACTIVE_KEY, 0, job_id)
    client.zadd(BULL_COMPLETED_KEY, {job_id: time.time()})
    client.zremrangebyrank(BULL_COMPLETED_KEY, 0, -1001)


def _fail_job(client: redis.Redis, job_id: str) -> None:
    """Move a job to the failed sorted set."""
    client.lrem(BULL_ACTIVE_KEY, 0, job_id)
    client.zadd(BULL_FAILED_KEY, {job_id: time.time()})
    client.zremrangebyrank(BULL_FAILED_KEY, 0, -501)



def run_worker() -> None:
    """
    Main blocking loop:
      1. Pop a job ID from the wait list (blocking, BPOP_TIMEOUT seconds).
      2. Push it to the active list (LMOVE — atomic in Redis >= 6.2).
      3. Extract task_id from the BullMQ job hash.
      4. Delegate to processor.process_task(task_id).
      5. Acknowledge / fail the job in Redis.
      6. Reconnect on Redis errors with exponential backoff.
    """
    log.info(
        "Worker starting",
        extra={"queue": QUEUE_NAME, "redis_url": REDIS_URL},
    )

    get_db()

    client = _create_redis_client()
    backoff = BACKOFF_BASE

    while _running:
        try:
            try:
                result = client.lmove(BULL_WAIT_KEY, BULL_ACTIVE_KEY, "LEFT", "RIGHT")
                if result is None:
                    time.sleep(1)
                    continue
                job_id = result
            except AttributeError:
                result = client.brpoplpush(BULL_WAIT_KEY, BULL_ACTIVE_KEY, timeout=BPOP_TIMEOUT)
                if result is None:
                    continue
                job_id = result

            log.info("Job dequeued", extra={"job_id": job_id})

            backoff = BACKOFF_BASE

            job_data = _get_job_data(client, job_id)
            if job_data is None:
                _fail_job(client, job_id)
                continue

            task_id: str = job_data.get("taskId", "")
            if not task_id:
                log.error(
                    "Job data missing taskId field",
                    extra={"job_id": job_id, "job_data": job_data},
                )
                _fail_job(client, job_id)
                continue

            process_task(task_id)

            _ack_job(client, job_id)
            log.info("Job acknowledged", extra={"job_id": job_id, "task_id": task_id})

        except (RedisConnectionError, RedisError) as exc:
            log.error(
                "Redis error in worker loop — reconnecting",
                extra={"error": str(exc), "retry_in_seconds": backoff},
            )
            time.sleep(backoff)
            backoff = min(backoff * 2, BACKOFF_MAX)

            try:
                client = _create_redis_client()
            except SystemExit:
                log.error("Could not reconnect to Redis. Worker exiting.")
                break

        except Exception as exc:  # noqa: BLE001
            log.exception("Unexpected error in worker loop", extra={"error": str(exc)})
            time.sleep(1)

    log.info("Worker shut down cleanly.")



if __name__ == "__main__":
    run_worker()
