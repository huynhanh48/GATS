from __future__ import annotations

from abc import ABC, abstractmethod

from .models import WebFetchItem


class WebFetchBase(ABC):
    @abstractmethod
    async def fetch(
        self,
        url: str,
        max_chars: int = 12000,
    ) -> WebFetchItem:
        pass
