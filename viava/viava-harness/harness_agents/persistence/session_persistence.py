from core.session import (
    SessionBase, 
    EndReason, 
    Message, 
    Session, 
    TokenCounts
)

from core.llm import LLMMessage
# Thêm logger chi tiết
class SessionPersistence:
    
    def __init__(self, store: SessionBase) -> None:
        self.store = store

    async def start_session(self, session_id: str, **kwargs) -> None:
        await self.store.create_session(session_id=session_id, **kwargs)
    
    async def end_session(
        self, session_id: str, reason: EndReason = EndReason.USER_QUIT
    ) -> None:
        await self.store.end_session(session_id=session_id, end_reason= reason)

    async def append_message(self, session_id: str, message: Message) -> None:
        await self.store.append_message(session_id= session_id, message= message)
    
    async def append_messages(self, session_id: str, messages: list[Message]) -> None:
        for msg in messages:
            await self.store.append_message(session_id, msg)
        
    async def update_token_counts(
        self, session_id: str, counts: TokenCounts
    ) -> None:
        await self.store.update_token_counts(session_id, counts)

    async def create_child_session(
        self, parent_id: str, child_id: str, **kwargs
    ) -> None:
        await self.store.create_session(
            session_id=child_id, parent_session_id=parent_id, **kwargs
        )
    
    # -- Read -----------------------------------------------------------

    async def session_exists(self, session_id: str) -> bool:
        s = await self.store.get_session(session_id)
        return s is not None

    async def load_session(self, session_id: str) -> Session | None:
        return await self.store.get_session(session_id)

    async def get_messages(
        self, session_id: str, *, limit: int = 1000, offset: int = 0
    ) -> list[Message]:
        return await self.store.get_messages(session_id, limit=limit, offset=offset)

    async def get_compression_tip(self, session_id: str) -> str | None:
        return await self.store.get_compression_tip(session_id)
    
    # -- helping -----------------------------------------------------------


    async def get_messages_as_llm(
        self, session_id: str, *, limit: int = 1000, offset: int = 0
    ) -> list[LLMMessage]:
        msgs = await self.store.get_messages(session_id, limit=limit, offset=offset)
        return [
            LLMMessage(role=m.role, content=m.content,
                       tool_calls=m.tool_calls, tool_call_id=m.tool_call_id)
            for m in msgs
        ]

    def to_session_msg(self, msg: LLMMessage, session_id: str) -> Message:
        return Message(
            session_id=session_id, role=msg.role, content=msg.content,
            tool_calls=msg.tool_calls, tool_call_id=msg.tool_call_id,
        )