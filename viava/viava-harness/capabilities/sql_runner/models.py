from pydantic import BaseModel


class RunSQLToolArgs(BaseModel):
    sql_query: str
