from __future__ import annotations

import asyncio
import uuid
import time
from typing import TYPE_CHECKING

from core.llm import BaseLLM, LLMMessage, TurnComplete


from core.tool.base import ToolBase
from core.tool.models import ToolCall, ToolResult
from core.user.models import User

from harness_agents.persistence.session_persistence import SessionPersistence
from harness_agents.tool.budget import ToolBudget
from harness_agents.tool.budget_store import ToolBudgetStore
from harness_agents.tool.engine import ToolEngine
from harness_agents.tool.executor import ToolExecutor
from harness_agents.tool.guardrails import ToolGuardrails

from harness_agents.context.micro_compressor import MicroCompressor
from harness_agents.prompt import PromptAssembler, StaticPrompt
from harness_agents.prompt.subagent import build_child_system_prompt


from .options import SubAgentOptions, SubAgentTask, SubAgentRole
from .bg_task import BackgroundTask, BackgroundTaskStatus

if TYPE_CHECKING:
    from harness_agents.agent_loop import (
        AgentLoop, 
        AgentConfig
    )

class SubAgentEngine:

    def __init__(
        self,
        options: SubAgentOptions,
        llm: BaseLLM,
        persistence: SessionPersistence,
        enabled_tool_names: list[str],
    ) -> None:
        self.options = options
        self.llm = llm
        self.persistence = persistence
        self.enabled_tool_names = enabled_tool_names
        self.bg_registry: dict[str, BackgroundTask] = {}
        self.completion_queue: asyncio.Queue[BackgroundTask] = asyncio.Queue()
        self.bg_semaphore = asyncio.Semaphore(options.max_background_tasks)
        self.bg_futures: dict[str, asyncio.Task] = {}

    async def spawn_background(
        self,
        tasks: list[SubAgentTask],
        user: User,
        parent_sid: str, # parent_session_id
        cwd: str,
        depth: int,
        active: list[AgentLoop]
    ) -> str:
        dispatch_id = str(uuid.uuid4())
        background_task = BackgroundTask(
            dispatch_id=dispatch_id,
            tasks=tasks,
            status=BackgroundTaskStatus.RUNNING,
            created_at=time.monotonic(),
        )

        self.bg_registry[dispatch_id] = background_task

        async def _runner():
            async with self.bg_semaphore:
                try:
                    timeout = self.options.background_timeout_seconds or None
                    result_text = await asyncio.wait_for(
                        self._run_bg_children(
                            tasks=tasks,
                            user=user,
                            parent_sid=parent_sid,
                            cwd=cwd,
                            depth=depth,
                            active=active
                        ),
                        timeout=timeout
                    )

                    background_task.status = BackgroundTaskStatus.COMPLETED
                    background_task.result = result_text
                
                except asyncio.TimeoutError:
                    background_task.status = BackgroundTaskStatus.TIMED_OUT
                    background_task.error = "background task timed out"

                except asyncio.CancelledError:
                    background_task.status = BackgroundTaskStatus.CANCELLED
                
                except Exception as e:
                    background_task.status = BackgroundTaskStatus.FAILED
                    background_task.error = str(e)

                finally:
                    self.completion_queue.put_nowait(background_task)
        
        task_future = asyncio.ensure_future(_runner())
        self.bg_futures[dispatch_id] = task_future
        return dispatch_id

    def cancel_background(self, dispatch_id: str) -> bool:
        bg_task = self.bg_registry.get(dispatch_id)
        if bg_task is None or bg_task.status != BackgroundTaskStatus.RUNNING:
            return False
        future = self.bg_futures.get(dispatch_id)
        if future is not None:
            future.cancel()
        return True

    async def shutdown(self) -> None:
        for dispatch_id, bg_task in list(self.bg_registry.items()):
            if bg_task.status == BackgroundTaskStatus.RUNNING:
                self.cancel_background(dispatch_id=dispatch_id)
        
        self.bg_registry.clear()
        self.bg_futures.clear()

    async def _run_bg_children(
        self,
        tasks: list[SubAgentTask],
        user: User,
        parent_sid: str,
        cwd: str,
        depth: int,
        active: list[AgentLoop]
    ) -> str:
        sem = asyncio.Semaphore(self.options.max_concurrent_children)

        async def _one(task: SubAgentTask, idx: int) -> str:
            async with sem:
                child, child_sid = await self._build_child(
                    task, user, parent_sid, cwd, depth, idx,
                )
                active.append(child)
                try:
                    msgs: list[LLMMessage] = [
                        LLMMessage(
                            role="user",
                            content=task.goal
                        )
                    ]

                    parts: list[str] = []
                    async for ev in child.run(
                        user=user,
                        session_id=child_sid,
                        messages=msgs,
                        cwd=cwd,
                    ):
                        if ev.__class__.__name__ == "TurnComplete":
                            parts.append(getattr(ev, "answer", ""))


                    return "\n".join(parts)
                
                finally:
                    if child in active:
                        active.remove(child)

        gathered = await asyncio.gather(
            *
            [
                _one(t,i)
                for i, t in enumerate(tasks)
            ]
        )
        return "\n".join(gathered)
    
    async def drain_completions(self) -> list[BackgroundTask]:
        results: list[BackgroundTask] = []
        while not self.completion_queue.empty():
            results.append(
                self.completion_queue.get_nowait()
            )
        
        return results

    async def intercept(
        self,
        calls: list[ToolCall],
        user: User,
        session_id: str,
        cwd: str,
        depth: int,
        active_children: list[AgentLoop],
    ) -> list[tuple[ToolCall, ToolResult]]:
        tasks = self._calls_to_tasks(calls)
        child_depth = depth + 1

        if depth == 0:
            results: list[ToolResult] = []
            for task in tasks:
                result = await self._run_async(
                    [task], user, session_id, cwd, child_depth, active_children,
                )
                results.append(result)
            return list(zip(calls, results))
        else:
            results = await self._run_sync(
                tasks, user, session_id, cwd, child_depth, active_children,
            )
            return list(zip(calls, results))

    def _calls_to_tasks(self, calls: list[ToolCall]) -> list[SubAgentTask]:
        tasks: list[SubAgentTask] = []
        for tc in calls:
            args = tc.arguments
            role_str = args.get("role", "leaf")
            role = SubAgentRole.ORCHESTRATOR if role_str == "orchestrator" else SubAgentRole.LEAF
            tasks.append(SubAgentTask(
                goal=args.get("goal", ""),
                context=args.get("context"),
                role=role,
            ))
        return tasks

    def _strip_tool_names(self, role: SubAgentRole) -> list[str]:
        blocked = set(self.options.blocked_tools)
        if role == SubAgentRole.ORCHESTRATOR:
            blocked.discard("sub_agent_task")
        return [n for n in self.enabled_tool_names if n not in blocked]

    def _build_tool_engine(self, tool_names: list[str]) -> ToolEngine:
        guardrails = ToolGuardrails()
        budget = ToolBudget()
        return ToolEngine(
            executor=ToolExecutor(guardrails=guardrails),
            guardrails=guardrails,
            budget_store=ToolBudgetStore(budget=budget),
            tool_budget=budget,
            enabled_tool_names=tool_names,
        )

    def _resolve_role(self, requested: SubAgentRole, depth: int) -> SubAgentRole:
        if not self.options.orchestrator_enabled:
            return SubAgentRole.LEAF
        if depth >= self.options.max_spawn_depth:
            return SubAgentRole.LEAF
        return requested

    async def _build_child(
        self,
        task: SubAgentTask,
        user: User,
        parent_sid: str,
        cwd: str,
        depth: int,
        index: int,
    ) -> tuple[AgentLoop, str]:
        from harness_agents.agent_loop.agent_loop import AgentConfig, AgentLoop
        role = self._resolve_role(task.role, depth)
        tool_names = self._strip_tool_names(role)
        tool_engine = self._build_tool_engine(tool_names)

        child_sid = str(uuid.uuid4())
        await self.persistence.create_child_session(
            parent_id=parent_sid,
            child_id=child_sid,
            cwd=cwd,
            user_id=user.id,
        )

        child_ctx = MicroCompressor(
            context_length=128_000,
            threshold_percent=0.50,
            protect_first_n=3,
            protect_last_n=6,
        )

        child_prompt = build_child_system_prompt(
            goal=task.goal,
            context=task.context,
            role=role,
            child_depth=depth,
            params=self.options,
        )

        config = AgentConfig(
            max_iterations=self.options.child_max_iterations,
        )

        child_assembler = PromptAssembler(
            identity_prompt=StaticPrompt(name="child_identity", content=""),
            tool_guidance_prompt=StaticPrompt(name="child_tools", content=""),
            platform_hint_prompt=StaticPrompt(name="child_platform", content=""),
            context_prompt=StaticPrompt(name="child_context", content=""),
            volatile_prompt=StaticPrompt(name="child_volatile", content=child_prompt),
        )

        child_loop = AgentLoop(
            llm=self.llm,
            tool_engine=tool_engine,
            persistence=self.persistence,
            context=child_ctx,
            config=config,
            sub_agent=SubAgentEngine(
                options=self.options,
                llm=self.llm,
                persistence=self.persistence,
                enabled_tool_names=tool_names,
            ),
            prompt_assembler=child_assembler,
        )
        child_loop._sub_agent_depth = depth
        child_loop._active_children = []
        return child_loop, child_sid

    async def _run_sync(
        self,
        tasks: list[SubAgentTask],
        user: User,
        parent_sid: str,
        cwd: str,
        depth: int,
        active: list[AgentLoop],
    ) -> list[ToolResult]:
        sem = asyncio.Semaphore(self.options.max_concurrent_children)

        async def _one(task: SubAgentTask, idx: int) -> str:
            async with sem:
                child, child_sid = await self._build_child(
                    task, user, parent_sid, cwd, depth, idx,
                )
                active.append(child)
                try:
                    msgs: list[LLMMessage] = [
                        LLMMessage(role="user", content=task.goal),
                    ]
                    parts: list[str] = []
                    async for ev in child.run(
                        user=user,
                        session_id=child_sid,
                        messages=msgs,
                        cwd=cwd,
                    ):
                        if ev.__class__.__name__ == "TurnComplete":
                            parts.append(getattr(ev, "answer", ""))
                    return "\n".join(parts)
                finally:
                    if child in active:
                        active.remove(child)

        gathered = await asyncio.gather(*[
            _one(t, i) for i, t in enumerate(tasks)
        ])
        return [ToolResult(success=True, result=text) for text in gathered]

    async def _run_async(
        self,
        tasks: list[SubAgentTask],
        user: User,
        parent_sid: str,
        cwd: str,
        depth: int,
        active: list[AgentLoop],
    ) -> ToolResult:
        did = str(uuid.uuid4())

        async def _one(task: SubAgentTask, idx: int) -> str:
            child, child_sid = await self._build_child(
                task, user, parent_sid, cwd, depth, idx,
            )
            active.append(child)
            try:
                msgs: list[LLMMessage] = [
                    LLMMessage(role="user", content=task.goal),
                ]

                parts: list[str] = []
                async for ev in child.run(
                    user=user,
                    session_id=child_sid,
                    messages=msgs,
                    cwd=cwd,
                ):
                    if ev.__class__.__name__ == "TurnComplete":
                        parts.append(getattr(ev, "answer", ""))
                return "\n".join(parts)
            finally:
                if child in active:
                    active.remove(child)

        asyncio.ensure_future(asyncio.gather(*[
            _one(t, i) for i, t in enumerate(tasks)
        ]))
        return ToolResult(
            success=True,
            result=f"dispatched:{did}:{len(tasks)}",
        )
