import uuid
from collections.abc import AsyncIterator

from core.llm import (
    BaseLLM,
    FinishReason,
    LLMInput,
    LLMMessage,
    BackgroundTaskStarted,
    BackgroundTaskCompleted,
    BackgroundTaskFailed,
    TextDelta,
    ToolExecutionCompleted,
    ToolExecutionStarted,
    TurnComplete,
)

from core.tool import (
    ToolCall,
    ToolContext,
    ToolResult,
)

from core.session import (
    EndReason,
    Message,
    TokenCounts,
)

from core.user import User

from harness_agents.tool import ToolEngine
from harness_agents.persistence import SessionPersistence
from harness_agents.context.base import BaseContext
from harness_agents.sub_agent import SubAgentEngine
from harness_agents.prompt  import PromptAssembler


from pydantic import BaseModel


class AgentConfig(BaseModel):
    max_iterations: int = 50
    temperature: float = 0.7
    max_tokens: int | None = None
    context_window_tokens: int = 200_000
    model_name: str = ""

class AgentState(BaseModel):
    model_config = {"arbitrary_types_allowed": True}
    current_iteration: int = 0
    cancelled: bool = False


class AgentLoop:
    def __init__(
        self,
        llm: BaseLLM,
        tool_engine: ToolEngine,
        persistence: SessionPersistence,
        context: BaseContext,
        config: AgentConfig,
        sub_agent: SubAgentEngine,
        prompt_assembler: PromptAssembler,
     
    ) -> None:
        self.llm = llm
        self.tool_engine = tool_engine
        self.persistence = persistence
        self.context = context
        self.config = config
        self.sub_agent = sub_agent
        self.prompt_assembler = prompt_assembler
        self._sub_agent_depth: int = 0
        self._active_children: list[AgentLoop] = []

    async def cancel(self) -> None:
        for child in self._active_children:
            child.cancel()
        await self.sub_agent.shutdown()

    async def run(
        self,
        user: User,
        session_id: str,
        cwd: str,
        messages: list[LLMMessage],
    ) -> AsyncIterator[
        TextDelta
        | ToolExecutionCompleted
        | ToolExecutionStarted
        | TurnComplete
        | BackgroundTaskStarted
        | BackgroundTaskCompleted
        | BackgroundTaskFailed
    ]:

        state = AgentState()
        while state.current_iteration < self.config.max_iterations:

            if state.cancelled:
                yield TurnComplete(finish_reason="cancelled")
                return

            rough = self.context.estimate_before_call(messages)
            if self.context.needs_compaction(prompt_tokens=rough):
                if not self.context.skip_estimate(rough):
                    messages = self.context.compact(messages)
                    self.prompt_assembler.invalidate()

            tool_defines = self.tool_engine.get_tool_defines()

            system_prompt = await self.prompt_assembler.build(
                cwd=cwd,
                context_window_tokens=self.config.context_window_tokens,
                model=self.config.model_name,
                session_id=session_id,
            )

            llm_input = LLMInput(
                messages=messages,
                tools=tool_defines,
                user_id=user.id,
                temperature=self.config.temperature,
                max_tokens=self.config.max_tokens,
                system_prompt=system_prompt
            )

            full_content = ""
            tool_calls: list[ToolCall] = []
            usage = None
            # trước khi gọi LLM
            async for chunk in self.llm.chat_stream(input=llm_input):
                if chunk.content:
                    full_content += chunk.content
                    yield TextDelta(text=chunk.content)

                if chunk.tool_calls:
                    tool_calls = chunk.tool_calls

                if chunk.usage:
                    usage = chunk.usage

                if chunk.finish_reason == FinishReason.TOOL_CALLS and tool_calls:
                    messages.append(
                        LLMMessage(
                            role="assistant",
                            content=full_content or None,
                            tool_calls=tool_calls,
                        )
                    )

            # sau khi gọi LLM

            if usage:
                self.context.track_usage(usage)
            if full_content or tool_calls:
                msg = Message(
                    session_id=session_id, role="assistant",
                    content=full_content or None,
                    tool_calls=tool_calls,
                )
                await self.persistence.append_message(session_id, msg)
            if usage:
                counts = TokenCounts(
                    input_tokens=usage.get("prompt_tokens", 0),
                    output_tokens=usage.get("completion_tokens", 0),
                    cache_read_tokens=usage.get("cached_tokens", 0),
                )
                await self.persistence.update_token_counts(session_id, counts)

            if not tool_calls:
                yield TurnComplete(finish_reason="stop", answer=full_content, usage=usage)
                return

            sub_calls = [tc for tc in tool_calls if tc.name == "sub_agent_task"]
            normal_calls = [tc for tc in tool_calls if tc.name != "sub_agent_task"]

            all_results: list[tuple[ToolCall, ToolResult]] = []

            if sub_calls:
                subagent_results = await self.sub_agent.intercept(
                    calls=sub_calls,
                    user=user,
                    session_id=session_id,
                    cwd=cwd,
                    depth=self._sub_agent_depth,
                    active_children=self._active_children,
                )
                for tc, rs in subagent_results:
                    if rs.result and rs.result.startswith("dispatched:"):
                        did = rs.result.split(":")[1]
                        tc_args = tc.arguments
                        yield BackgroundTaskStarted(
                            dispatch_id=did,
                            task_count=1,
                            goal=tc_args.get("goal", ""),
                        )
                all_results.extend(subagent_results)

            if normal_calls:
                tool_context = ToolContext(
                    conv_id=session_id,
                    request_id=str(uuid.uuid4()),
                    user=user,
                )


                normal_results = await self.tool_engine.execute_all(normal_calls, tool_context)
                for tc, r in zip(normal_calls, normal_results):
                    all_results.append((tc, r))

                

            for tc, result in all_results:
                yield ToolExecutionStarted(tool_name=tc.name, tool_input=tc.arguments)
                yield ToolExecutionCompleted(
                    tool_name=tc.name,
                    output=result.result,
                    is_error=not result.success,
                )
                messages.append(
                    LLMMessage(
                        role="tool",
                        content=result.result,
                        tool_call_id=tc.id,
                    )
                )
                await self.persistence.append_message(
                    session_id,
                    Message(
                        session_id=session_id,
                        role="tool",
                        content=result.result,
                        tool_call_id=tc.id,
                    ),
                )

            completed_bg = await self.sub_agent.drain_completions()
            for bg in completed_bg:
                if bg.status.value == "completed" and bg.result:
                    inject_msg = LLMMessage(
                        role="system",
                        content=f"[background task completed: {bg.dispatch_id}]\n{bg.result}",
                    )
                    messages.append(inject_msg)
                    await self.persistence.append_message(
                        session_id=session_id,
                        message=Message(
                            session_id=session_id,
                            role="system",
                            content=inject_msg.content,
                        ),
                    )
                    yield BackgroundTaskCompleted(
                        dispatch_id=bg.dispatch_id,
                        result=bg.result,
                        usage=bg.usage
                    )
                
                elif bg.error:
                    inject_msg = LLMMessage(
                        role="system",
                        content=f"[background task {bg.dispatch_id} {bg.status.value}]\nError: {bg.error}",
                    )
                    messages.append(inject_msg)
                    await self.persistence.append_message(
                        session_id,
                        Message(
                            session_id=session_id,
                            role="system",
                            content=inject_msg.content,
                        ),
                    )
                    yield BackgroundTaskFailed(
                        dispatch_id=bg.dispatch_id,
                        error=bg.error,
                    )



            state.current_iteration += 1

            if self.context.needs_compaction():
                messages = self.context.compact(messages)
                await self.persistence.end_session(session_id, EndReason.COMPRESSION)

                new_id = str(uuid.uuid4())
                await self.persistence.create_child_session(
                    session_id, new_id, cwd=cwd, user_id=user.id
                )

                session_id = new_id
        yield TurnComplete(finish_reason="max_iterations")
