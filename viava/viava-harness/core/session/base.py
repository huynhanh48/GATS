from __future__ import annotations

from abc import ABC, abstractmethod

from core.session.models import (
    EndReason,
    Message,
    Session,
    SessionSummary,
    SearchResult,
    TokenCounts,
)


class SessionBase(ABC):

    @abstractmethod
    async def create_session(
        self, session_id: str, cwd: str, *,
        user_id: str,
        model: str | None = None,
        model_config: dict | None = None,
        system_prompt: str | None = None,
        parent_session_id: str | None = None,
    ) -> Session:
        ...

    @abstractmethod
    async def get_session(self, session_id: str) -> Session | None:
        ...

    @abstractmethod
    async def end_session(self, session_id: str, end_reason: EndReason) -> None:
        ...

    @abstractmethod
    async def delete_session(self, session_id: str) -> bool:
        ...

    @abstractmethod
    async def list_sessions(
        self, *, cwd: str | None = None, user_id: str | None = None,
        limit: int = 50, offset: int = 0,
        include_children: bool = False,
    ) -> list[SessionSummary]:
        ...

    @abstractmethod
    async def resolve_session_id(self, prefix: str) -> str | None:
        ...

    @abstractmethod
    async def append_message(self, session_id: str, message: Message) -> None:
        ...

    @abstractmethod
    async def get_messages(
        self, session_id: str, *, limit: int = 1000, offset: int = 0,
    ) -> list[Message]:
        ...

    @abstractmethod
    async def get_child_sessions(self, parent_session_id: str) -> list[Session]:
        ...

    @abstractmethod
    async def get_compression_tip(self, session_id: str) -> str | None:
        ...

    @abstractmethod
    async def get_session_lineage(self, session_id: str) -> list[str]:
        ...

    @abstractmethod
    async def update_token_counts(self, session_id: str, counts: TokenCounts) -> None:
        ...

    @abstractmethod
    async def search_messages(
        self, query: str, *, session_id: str | None = None, limit: int = 20,
    ) -> list[SearchResult]:
        ...

    @abstractmethod
    async def search_sessions(
        self, query: str, *, limit: int = 20,
    ) -> list[SessionSummary]:
        ...

    @abstractmethod
    async def update_session_meta(
        self, session_id: str, *, model: str | None = None,
        title: str | None = None, cwd: str | None = None,
        **kwargs,
    ) -> None:
        ...

    @abstractmethod
    async def reopen_session(self, session_id: str) -> None:
        ...
