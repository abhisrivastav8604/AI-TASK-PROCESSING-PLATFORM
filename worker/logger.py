"""
logger.py — Structured logging for the worker service.

Outputs JSON-formatted logs in production and human-readable text in
development. All worker modules import this shared logger instance.
"""

import logging
import json
import os
import sys
from datetime import datetime, timezone


class JSONFormatter(logging.Formatter):
    """
    Custom formatter that serialises every log record as a JSON object.
    This makes logs trivially parseable by log aggregation tools
    (Loki, Fluentd, CloudWatch, etc.).
    """

    def format(self, record: logging.LogRecord) -> str:  # noqa: A003
        log_obj = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
        }
        for key, value in record.__dict__.items():
            if key not in (
                "args", "asctime", "created", "exc_info", "exc_text",
                "filename", "funcName", "id", "levelname", "levelno",
                "lineno", "module", "msecs", "message", "msg", "name",
                "pathname", "process", "processName", "relativeCreated",
                "stack_info", "thread", "threadName",
            ):
                log_obj[key] = value

        if record.exc_info:
            log_obj["exception"] = self.formatException(record.exc_info)

        return json.dumps(log_obj, default=str)


def get_logger(name: str = "worker") -> logging.Logger:
    """
    Build and return a configured logger.

    Args:
        name: Logger name (shows up in the 'logger' JSON field).

    Returns:
        A configured :class:`logging.Logger` instance.
    """
    node_env = os.getenv("NODE_ENV", "development")
    log_level_str = os.getenv("LOG_LEVEL", "INFO").upper()
    log_level = getattr(logging, log_level_str, logging.INFO)

    logger = logging.getLogger(name)
    logger.setLevel(log_level)

    if logger.handlers:
        return logger

    handler = logging.StreamHandler(sys.stdout)
    handler.setLevel(log_level)

    if node_env == "production":
        handler.setFormatter(JSONFormatter())
    else:
        fmt = "%(asctime)s [%(levelname)s] %(name)s: %(message)s"
        handler.setFormatter(logging.Formatter(fmt, datefmt="%Y-%m-%dT%H:%M:%S"))

    logger.addHandler(handler)
    logger.propagate = False

    return logger
