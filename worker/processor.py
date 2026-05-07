"""
processor.py — Core task processing logic.

Each function corresponds to one of the supported `operation` values defined
in the Task model. The processor is intentionally stateless: it receives a
task document dict, performs the operation, and returns the result string.

Keeping processing logic in its own module makes it easy to:
  - Unit-test independently of Redis/MongoDB plumbing
  - Add new operations without touching the worker entrypoint
  - Scale horizontally (stateless design)
"""

from datetime import datetime, timezone
from typing import Any

from bson import ObjectId

from db import get_tasks_collection
from logger import get_logger

log = get_logger("worker.processor")



def _op_uppercase(text: str) -> str:
    return text.upper()


def _op_lowercase(text: str) -> str:
    return text.lower()


def _op_reverse(text: str) -> str:
    return text[::-1]


def _op_word_count(text: str) -> str:
    count = len(text.split())
    return f"{count} words"


_OPERATION_HANDLERS: dict[str, Any] = {
    "uppercase":  _op_uppercase,
    "lowercase":  _op_lowercase,
    "reverse":    _op_reverse,
    "word_count": _op_word_count,
}



def process_task(task_id: str) -> None:
    """
    Fetch, process, and update a single task document.

    Workflow:
        1. Fetch task from MongoDB.
        2. Mark status → "running", append start log.
        3. Execute the operation handler.
        4. Mark status → "success", save result, append completion log.
        5. On ANY exception: mark status → "failed", append error log.

    Args:
        task_id: The MongoDB ObjectId string of the task to process.

    Raises:
        Does NOT raise — all exceptions are caught and persisted to the task
        document so the worker process stays alive for the next job.
    """
    tasks = get_tasks_collection()
    now = _now_iso()

    try:
        oid = ObjectId(task_id)
    except Exception as exc:  # noqa: BLE001
        log.error("Invalid task_id format", extra={"task_id": task_id, "error": str(exc)})
        return

    task = tasks.find_one({"_id": oid})
    if task is None:
        log.error("Task not found in MongoDB", extra={"task_id": task_id})
        return

    operation = task.get("operation", "")
    log.info("Processing task", extra={"task_id": task_id, "operation": operation})

    _update_task(tasks, oid, {
        "$set": {"status": "running", "updatedAt": _now_dt()},
        "$push": {"logs": f"Task started at {now}"},
    })

    try:
        handler = _OPERATION_HANDLERS.get(operation)
        if handler is None:
            raise ValueError(f"Unknown operation: '{operation}'")

        input_text: str = task.get("inputText", "")
        result: str = handler(input_text)

        completed_at = _now_iso()
        _update_task(tasks, oid, {
            "$set": {
                "status": "success",
                "result": result,
                "updatedAt": _now_dt(),
            },
            "$push": {"logs": f"Completed at {completed_at}"},
        })

        log.info(
            "Task completed successfully",
            extra={"task_id": task_id, "operation": operation},
        )

    except Exception as exc:  # noqa: BLE001
        error_msg = f"Error at {_now_iso()}: {type(exc).__name__}: {exc}"
        log.exception("Task processing failed", extra={"task_id": task_id})

        _update_task(tasks, oid, {
            "$set": {"status": "failed", "updatedAt": _now_dt()},
            "$push": {"logs": error_msg},
        })



def _update_task(collection: Any, oid: ObjectId, update: dict) -> None:
    """
    Apply a MongoDB update to the task document.
    Logs a warning if the document wasn't found (e.g., deleted mid-flight).
    """
    result = collection.update_one({"_id": oid}, update)
    if result.matched_count == 0:
        log.warning("update_one matched 0 documents", extra={"task_id": str(oid)})


def _now_dt() -> datetime:
    """Return the current UTC datetime (timezone-aware)."""
    return datetime.now(timezone.utc)


def _now_iso() -> str:
    """Return the current UTC time as an ISO-8601 string."""
    return _now_dt().isoformat()
