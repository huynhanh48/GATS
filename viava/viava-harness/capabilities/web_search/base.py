from __future__ import annotations

from abc import ABC, abstractmethod
from typing import List, Optional

from .models import WebSearchResult


class WebSearchBase(ABC):
    @abstractmethod
    async def search(
        self,
        query: str,
        max_results: int = 3,
        include_domains: Optional[List[str]] = None,
        exclude_domains: Optional[List[str]] = None,
    ) -> WebSearchResult:
        pass
