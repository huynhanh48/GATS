from __future__ import annotations

from typing import Optional


class AppError(Exception):
    def __init__(self, code: str, message: str, details: Optional[str] = None) -> None:
        self.code = code
        self.message = message
        self.details = details
