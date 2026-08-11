from pydantic import BaseModel, Field


class SqlKnowledgeResult(BaseModel):
    tables: list[str] = Field(default_factory=list)
    additional_context: list[str] = Field(default_factory=list)
    question_sql_pairs: list[dict] = Field(default_factory=list)
