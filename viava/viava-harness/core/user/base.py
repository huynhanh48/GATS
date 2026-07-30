from abc import ABC, abstractmethod
from typing import Any, Dict

from .models import User

class UserBase(ABC):
    @abstractmethod
    async def get_user(self, user_id: str) -> User | None:
        ...
    
    @abstractmethod
    async def authenticate(self, credentials: Dict[str, Any]) -> User | None:
        ...

    @abstractmethod
    async def has_permission(self, user: User, permission: str) -> bool:
        ...