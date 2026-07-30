from pydantic import BaseModel


class EmbeddingResponse(BaseModel):
    embedding: list[float]
    index: int
    usage: dict | None = None
    cached: bool = False
