from pydantic import BaseModel


class TextDelta(BaseModel):
    text: str


class ToolExecutionStarted(BaseModel):
    tool_name: str
    tool_input: dict


class ToolExecutionCompleted(BaseModel):
    tool_name: str
    output: str
    is_error: bool = False


class TurnComplete(BaseModel):
    finish_reason: str
    answer: str = ""
    usage: dict | None = None


class BackgroundTaskStarted(BaseModel):
    dispatch_id: str
    task_count: int
    goal: str


class BackgroundTaskCompleted(BaseModel):
    dispatch_id: str
    result: str
    usage: dict | None = None

class BackgroundTaskFailed(BaseModel):
    dispatch_id: str
    error: str