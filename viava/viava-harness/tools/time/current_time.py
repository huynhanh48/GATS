from __future__ import annotations

import logging
from typing import Type

from pydantic import BaseModel

from capabilities.current_time import CurrentTimeBase
from core.tool import ToolBase, ToolContext, ToolResult

logger = logging.getLogger(__name__)


class CurrentTimeArgs(BaseModel):
    timezone: str = "Asia/Ho_Chi_Minh"


class CurrentTimeTool(ToolBase[CurrentTimeArgs]):
    name = "current_time"
    toolset = "time"
    description = "Lấy thời gian hiện tại theo múi giờ. Hỗ trợ tên IANA (vd: 'Asia/Ho_Chi_Minh', 'America/New_York') hoặc offset UTC (vd: 'UTC+7', 'UTC-5')."

    def __init__(self, time_service: CurrentTimeBase) -> None:
        self._time_service = time_service

    def is_available(self) -> bool:
        return self._time_service is not None

    def get_args_tool(self) -> Type[CurrentTimeArgs]:
        return CurrentTimeArgs

    async def execute(self, context: ToolContext, args: CurrentTimeArgs) -> ToolResult:
        try:
            result = await self._time_service.get_current_time(timezone=args.timezone)
            lines = [
                f"Thời gian hiện tại ({result.timezone}):",
                f"   Giờ: {result.local_time}",
                f"   Ngày: {result.date}",
                f"   Thứ: {result.weekday}",
                f"   UTC Offset: {result.utc_offset}",
            ]
            return ToolResult(success=True, result="\n".join(lines))
        except Exception as e:
            logger.exception("current_time failed")
            return ToolResult(success=False, result=str(e), error=str(e))
