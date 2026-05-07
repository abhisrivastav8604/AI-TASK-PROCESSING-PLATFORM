"""
db.py — MongoDB connection management for the worker service.

Uses pymongo with connection pooling. The module exposes a lazy singleton
client so multiple worker replicas each maintain their own independent
connection pool without sharing state.
"""

import os
import time
from typing import Optional

from pymongo import MongoClient
from pymongo.collection import Collection
from pymongo.database import Database
from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError

from logger import get_logger

log = get_logger("worker.db")

_client: Optional[MongoClient] = None
_db: Optional[Database] = None


def get_db() -> Database:
    """
    Return the singleton pymongo Database instance, creating it on first call.

    The connection uses exponential backoff so the worker gracefully handles
    temporary MongoDB unavailability (e.g., during pod restarts in k8s).

    Returns:
        A :class:`~pymongo.database.Database` object.

    Raises:
        SystemExit: If all retry attempts are exhausted.
    """
    global _client, _db  # noqa: PLW0603

    if _db is not None:
        return _db

    mongo_uri = os.getenv("MONGO_URI")
    if not mongo_uri:
        log.error("MONGO_URI environment variable is not set")
        raise RuntimeError("MONGO_URI is required")

    db_name = _parse_db_name(mongo_uri)

    _client, _db = _connect_with_backoff(mongo_uri, db_name)
    return _db


def get_tasks_collection() -> Collection:
    """Convenience helper — returns the 'tasks' collection."""
    return get_db()["tasks"]


def _parse_db_name(uri: str) -> str:
    """
    Extract the database name from a MongoDB URI.
    Falls back to 'ai_tasks' if the URI contains no path component.
    """
    try:
        path_part = uri.split("/")[-1].split("?")[0]
        return path_part if path_part else "ai_tasks"
    except Exception:  # noqa: BLE001
        return "ai_tasks"


def _connect_with_backoff(
    uri: str,
    db_name: str,
    max_retries: int = 6,
    base_delay: float = 1.0,
    max_delay: float = 32.0,
) -> tuple[MongoClient, Database]:
    """
    Attempt to connect to MongoDB with exponential backoff.

    Args:
        uri:         MongoDB connection string.
        db_name:     Name of the database to use.
        max_retries: Maximum number of connection attempts.
        base_delay:  Initial delay between retries (seconds).
        max_delay:   Maximum delay cap (seconds).

    Returns:
        Tuple of (MongoClient, Database).

    Raises:
        SystemExit: After all retries are exhausted.
    """
    attempt = 0
    delay = base_delay

    while attempt < max_retries:
        try:
            client = MongoClient(
                uri,
                serverSelectionTimeoutMS=5000,
                maxPoolSize=10,       # match backend pool size
                minPoolSize=1,
                connectTimeoutMS=5000,
                socketTimeoutMS=30000,
            )
            client.admin.command("ping")
            db = client[db_name]
            log.info("MongoDB connected", extra={"database": db_name})
            return client, db

        except (ConnectionFailure, ServerSelectionTimeoutError) as exc:
            attempt += 1
            remaining = max_retries - attempt
            log.warning(
                "MongoDB connection failed",
                extra={
                    "error": str(exc),
                    "attempt": attempt,
                    "retries_remaining": remaining,
                    "retry_in_seconds": delay,
                },
            )
            if remaining == 0:
                log.error("All MongoDB connection attempts exhausted. Exiting.")
                raise SystemExit(1) from exc

            time.sleep(delay)
            delay = min(delay * 2, max_delay)   # exponential backoff with cap

    raise SystemExit(1)
