import time
from collections.abc import AsyncGenerator
from pathlib import Path

from core.llm import (
    BaseLLM,
    LLMMessage,
    BackgroundTaskStarted,
    BackgroundTaskCompleted,
    BackgroundTaskFailed,
    TextDelta,
    ToolExecutionCompleted,
    ToolExecutionStarted,
    TurnComplete,
)

from core.user import User
from core.session import Message

from .persistence import SessionPersistence
from .context import BaseContext
from .agent_loop import AgentConfig, AgentLoop
from .tool.engine import ToolEngine
from .sub_agent import SubAgentOptions, SubAgentEngine

from .prompt import (
    PromptAssembler,
    IdentityPrompt,
    ToolGuidancePrompt,
    PlatformHintPrompt,
    ContextPrompt,
    FileScanner,
    VolatilePrompt,
)

from utils.terminal import (
    styled, tool_start, tool_done, agent_prompt, user_prompt,
    boot_line, system_info, GRAY, DIM,
)
from utils.paths import get_identity_path


class HarnessAgents:
    def __init__(
        self,
        llm: BaseLLM,
        tool_engine: ToolEngine,
        persistence: SessionPersistence,
        context: BaseContext,
        loop_config: AgentConfig,
        identity_path: str = "",
    ) -> None:
        self.llm = llm
        self.tool_engine = tool_engine
        self.persistence = persistence
        self.context = context
        self.config = loop_config

        if not identity_path:
            identity_path = str(get_identity_path())

        prompt_assembler = PromptAssembler(
            identity_prompt=IdentityPrompt(
                name="identity",
                identity_path=identity_path,
            ),
            tool_guidance_prompt=ToolGuidancePrompt(name="tool_guidance"),
            platform_hint_prompt=PlatformHintPrompt(
                name="platform_hint",
            ),
            context_prompt=ContextPrompt(
                name="context",
                scanner=FileScanner(),
            ),
            volatile_prompt=VolatilePrompt(name="volatile"),
        )

        from tools.registry import registry

        self.loop = AgentLoop(
            llm=self.llm,
            tool_engine=self.tool_engine,
            persistence=self.persistence,
            context=self.context,
            config=self.config,
            sub_agent=SubAgentEngine(
                options=SubAgentOptions(),
                llm=self.llm,
                persistence=self.persistence,
                enabled_tool_names=registry.list_tool_names(),
            ),
            prompt_assembler=prompt_assembler,
        )

    async def infer(
        self,
        user_input: str,
        user: User,
        session_id: str,
        cwd: str,
    ) -> AsyncGenerator[
        TextDelta
        | ToolExecutionCompleted
        | ToolExecutionStarted
        | TurnComplete
        | BackgroundTaskStarted
        | BackgroundTaskCompleted
        | BackgroundTaskFailed,
        None,
    ]:
        self.tool_engine.reset_turn()
        messages = await self._build_messages(
            user_id=user.id,
            user_input=user_input,
            session_id=session_id,
            cwd=cwd,
        )
        
        async for event in self.loop.run(
            user=user,
            messages=messages,
            session_id=session_id,
            cwd=cwd,
        ):
            yield event

    async def infor_show(
        self, 
        user_input: str,
        user: User,
        session_id: str,
        cwd: str,
    ) -> None:
        self.tool_engine.reset_turn()
        start = time.time()
        messages = await self._build_messages(
            user_id=user.id,
            user_input=user_input,
            session_id=session_id,
            cwd=cwd,
        )

        print("╔" + "═" * 48 + "╗")
        print(f"║  📥 Input : {user_input[:60]}")
        print(f"║  ⚙️  Config: max_iter={self.config.max_iterations}, temp={self.config.temperature:.2f}, max_tokens={self.config.max_tokens}")
        print("╚" + "═" * 48 + "╝")

        collected_content: list[str] = []
        usage = None
        finish_reason = "unknown"

        async for event in self.loop.run(
            user=user,
            messages=messages,
            session_id=session_id,
            cwd=cwd,
        ):
            match event:
                case TextDelta(text=t):
                    collected_content.append(t)
                    print(t, end="", flush=True)
                case TurnComplete(finish_reason=r, answer=a, usage=u):
                    finish_reason = r
                    usage = u
                case BackgroundTaskStarted(dispatch_id=did, goal=g):
                    pass
                case BackgroundTaskCompleted(dispatch_id=did, result=r):
                    pass
                case _:
                    pass

        elapsed = time.time() - start
        total_chars = sum(len(s) for s in collected_content)

    async def run_show_debug(
        self,
        user_input: str,
        user: User,
        session_id: str,
        cwd: str,
        show_debug: bool = True,
    ) -> None:
        self.tool_engine.reset_turn()
        start = time.time()
        messages = await self._build_messages(
            user_id=user.id,
            user_input=user_input,
            session_id=session_id,
            cwd=cwd,
        )

        print(user_prompt() + user_input)

        first_text = True
        tool_count = 0
        usage = None
        finish_reason = "unknown"

        async for event in self.loop.run(
            user=user,
            messages=messages,
            session_id=session_id,
            cwd=cwd,
        ):
            match event:
                case TextDelta(text=t):
                    if first_text:
                        print(agent_prompt(), end="", flush=True)
                        first_text = False
                    print(t, end="", flush=True)

                case ToolExecutionStarted(tool_name=name):
                    if show_debug:
                        print(f"\n{tool_start(name)}", end="", flush=True)

                case ToolExecutionCompleted(tool_name=name, is_error=err, output=out):
                    if show_debug:
                        print(tool_done(name, err, out))
                    tool_count += 1

                case TurnComplete(finish_reason=r, answer=a, usage=u):
                    finish_reason = r
                    usage = u

                case BackgroundTaskStarted(dispatch_id=did, goal=g):
                    pass

                case BackgroundTaskCompleted(dispatch_id=did, result=r):
                    pass

                case _:
                    pass

        elapsed = time.time() - start
        tokens = (usage or {}).get("total_tokens", "N/A")
        print()
        if show_debug:
            print(styled(f"─ {finish_reason} │ {tool_count} tools │ {elapsed:.2f}s │ {tokens} tokens", DIM))

    async def _build_messages(
        self, 
        user_input: str,
        user_id: str,
        session_id: str,
        cwd: str
    ) -> list[LLMMessage]:
        if await self.persistence.session_exists(session_id):
            messages = await self.persistence.get_messages_as_llm(session_id)
        else:
            await self.persistence.start_session(session_id, cwd=cwd, user_id=user_id)
            messages = []

        messages.append(LLMMessage(role="user", content=user_input))
        session_msg = Message(session_id=session_id, role="user", content=user_input)
        await self.persistence.append_message(session_id, session_msg)

        return messages
