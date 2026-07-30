from pydantic import BaseModel


class SqlOutput(BaseModel):
    sql: str
    explanation: str = ""
    tokens_used: int = 0
