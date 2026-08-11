from pydantic import BaseModel, Field


class TextToSQLInput(BaseModel):
    natural_language: str
    max_retries: int = 3


class TextToSQLOutput(BaseModel):
    sql: str
    explanation: str = ""
    confidence: float = 0.0
    retry_count: int = 0
    schema_tables_used: list[str] = Field(default_factory=list)
    error: str | None = None
