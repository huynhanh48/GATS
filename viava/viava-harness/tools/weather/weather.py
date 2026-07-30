from __future__ import annotations

import logging
from typing import Type

from pydantic import BaseModel

from capabilities.weather import WeatherBase
from core.tool import ToolBase, ToolContext, ToolResult

logger = logging.getLogger(__name__)


class WeatherArgs(BaseModel):
    location: str
    date: str | None = None


class WeatherTool(ToolBase[WeatherArgs]):
    name = "weather"
    toolset = "weather"
    description = "Tra cứu thời tiết hiện tại hoặc dự báo theo địa điểm. Cung cấp ngày (YYYY-MM-DD hoặc 'today') để xem dự báo."

    def __init__(self, weather: WeatherBase) -> None:
        self._weather = weather

    def is_available(self) -> bool:
        return self._weather is not None

    def get_args_tool(self) -> Type[WeatherArgs]:
        return WeatherArgs

    async def execute(self, context: ToolContext, args: WeatherArgs) -> ToolResult:
        try:
            result = await self._weather.get_weather(location=args.location, date=args.date)
            lines = [
                f"Thời tiết tại {result.location}, {result.country}:",
                f"   Nhiệt độ: {result.temperature_c}°C ({result.temperature_f}°F)",
                f"   Cảm giác như: {result.feelslike_c}°C",
                f"   Trạng thái: {result.condition.text}",
                f"   Độ ẩm: {result.humidity}%",
                f"   Gió: {result.wind_kph} km/h",
                f"   Giờ địa phương: {result.local_time}",
            ]
            if result.forecast:
                lines.append("\n   Dự báo:")
                for day in result.forecast:
                    lines.append(f"   - {day.date}: {day.condition.text}, {day.min_temp_c}~{day.max_temp_c}°C")
            return ToolResult(success=True, result="\n".join(lines))
        except Exception as e:
            logger.exception("weather failed")
            return ToolResult(success=False, result=str(e), error=str(e))
