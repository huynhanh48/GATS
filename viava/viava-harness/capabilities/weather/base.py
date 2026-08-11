from __future__ import annotations

from abc import ABC, abstractmethod
from typing import Optional

from .models import WeatherResult


class WeatherBase(ABC):
    @abstractmethod
    async def get_weather(
        self,
        location: str,
        date: Optional[str] = None,
    ) -> WeatherResult:
        pass
