from typing import Any, Dict, List
from pydantic import BaseModel, Field


class User(BaseModel):
    id: str
    username: str
    email: str
    metadata: Dict[str, Any] = Field(default_factory=dict)
    group_memberships: List[str] = Field(default_factory=list)
