from __future__ import annotations

from abc import ABC, abstractmethod

from .models import TimeResult


class CurrentTimeBase(ABC):
    @abstractmethod
    async def get_current_time(
        self,
        timezone: str,
    ) -> TimeResult:
        pass
