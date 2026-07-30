from enum import StrEnum
from pydantic import BaseModel
from .options import SubAgentTask

class BackgroundTaskStatus(StrEnum):
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"
    TIMED_OUT = "timed_out"

class BackgroundTask(BaseModel):
    dispatch_id: str
    tasks: list[SubAgentTask]
    status: BackgroundTaskStatus = BackgroundTaskStatus.RUNNING
    created_at: float = 0.0
    result: str | None = None
    error: str | None = None
    usage: dict | None = None