from __future__ import annotations

import logging
from typing import Dict, List, Optional

import httpx

from capabilities.weather import WeatherBase, WeatherCondition, ForecastDay, WeatherResult

logger = logging.getLogger(__name__)

WEATHERAPI_BASE = "https://api.weatherapi.com/v1"


class WeatherAPIWeather(WeatherBase):
    def __init__(self, api_key: str, client: Optional[httpx.AsyncClient] = None, timeout: int = 10) -> None:
        self._api_key = api_key
        self._client = client
        self._timeout = timeout

    async def get_weather(
        self,
        location: str,
        date: Optional[str] = None,
    ) -> WeatherResult:
        params: Dict = {"key": self._api_key, "q": location, "aqi": "no"}

        if date and date.lower() == "today":
            params["days"] = "2"
            endpoint = f"{WEATHERAPI_BASE}/forecast.json"
        elif date:
            params["dt"] = date
            params["days"] = "1"
            endpoint = f"{WEATHERAPI_BASE}/forecast.json"
        else:
            params["days"] = "2"
            endpoint = f"{WEATHERAPI_BASE}/forecast.json"

        client = self._client if self._client else httpx.AsyncClient(timeout=self._timeout)
        try:
            if self._client is None:
                async with client:
                    return await self._fetch(client, endpoint, params, location)
            return await self._fetch(client, endpoint, params, location)
        except httpx.HTTPError:
            logger.exception("WeatherAPI request failed")
            return WeatherResult(
                location=location, country="", local_time="",
                temperature_c=0.0, temperature_f=0.0,
                condition=WeatherCondition(text="", icon="", code=0),
                humidity=0, wind_kph=0.0, feelslike_c=0.0,
            )

    async def _fetch(self, client: httpx.AsyncClient, endpoint: str, params: Dict, location: str) -> WeatherResult:
        resp = await client.get(endpoint, params=params)
        resp.raise_for_status()
        data = resp.json()

        current = data.get("current", {})
        condition_data = current.get("condition", {})
        condition = WeatherCondition(
            text=condition_data.get("text", ""),
            icon=condition_data.get("icon", ""),
            code=condition_data.get("code", 0),
        )

        location_data = data.get("location", {})
        result = WeatherResult(
            location=location_data.get("name", location),
            country=location_data.get("country", ""),
            local_time=location_data.get("localtime", ""),
            temperature_c=current.get("temp_c", 0.0),
            temperature_f=current.get("temp_f", 0.0),
            condition=condition,
            humidity=current.get("humidity", 0),
            wind_kph=current.get("wind_kph", 0.0),
            feelslike_c=current.get("feelslike_c", 0.0),
        )

        if "forecast" in data:
            forecast_days = data["forecast"].get("forecastday", [])
            result.forecast = []
            for day in forecast_days:
                fc_cond = day.get("day", {}).get("condition", {})
                result.forecast.append(ForecastDay(
                    date=day.get("date", ""),
                    max_temp_c=day.get("day", {}).get("maxtemp_c", 0.0),
                    min_temp_c=day.get("day", {}).get("mintemp_c", 0.0),
                    condition=WeatherCondition(
                        text=fc_cond.get("text", ""),
                        icon=fc_cond.get("icon", ""),
                        code=fc_cond.get("code", 0),
                    ),
                ))

        return result
