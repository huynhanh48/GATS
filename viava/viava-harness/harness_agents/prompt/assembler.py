from .identity import IdentityPrompt
from .stable import ToolGuidancePrompt, PlatformHintPrompt
from .context import ContextPrompt
from .volatile import VolatilePrompt


class PromptAssembler:
    def __init__(
        self,
        identity_prompt: IdentityPrompt,
        tool_guidance_prompt: ToolGuidancePrompt,
        platform_hint_prompt: PlatformHintPrompt,
        context_prompt: ContextPrompt,
        volatile_prompt: VolatilePrompt,
    ) -> None:
        self._identity = identity_prompt
        self._tool_guidance = tool_guidance_prompt
        self._platform = platform_hint_prompt
        self._context = context_prompt
        self._volatile = volatile_prompt
        self._cached: str | None = None

    async def build(
        self,
        cwd: str,
        context_window_tokens: int,
        model: str = "",
        session_id: str = "",
        ephemeral: str | None = None,
    ) -> str:
        if self._cached is not None:
            result = self._cached
        else:
            stable = await self._build_stable()
            context = await self._context.render(
                cwd=cwd,
                context_window_tokens=context_window_tokens,
            )
            volatile = await self._volatile.render(
                model=model,
                session_id=session_id,
            )
            parts = [p for p in [stable, context, volatile] if p]
            result = "\n\n".join(parts)
            self._cached = result

        if ephemeral:
            result = f"{result}\n\n{ephemeral}"

        return result

    async def _build_stable(self) -> str:
        identity = await self._identity.render()
        tools = await self._tool_guidance.render()
        platform = await self._platform.render()
        parts = [p for p in [identity, tools, platform] if p]
        return "\n\n".join(parts)

    def invalidate(self) -> None:
        self._cached = None