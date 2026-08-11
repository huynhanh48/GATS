from __future__ import annotations

from typing import List, Optional
from pydantic import BaseModel, Field


class WeatherCondition(BaseModel):
    text: str
    icon: str
    code: int


class ForecastDay(BaseModel):
    date: str
    max_temp_c: float
    min_temp_c: float
    condition: WeatherCondition


class WeatherResult(BaseModel):
    location: str
    country: str
    local_time: str
    temperature_c: float
    temperature_f: float
    condition: WeatherCondition
    humidity: int
    wind_kph: float
    feelslike_c: float
    forecast: Optional[List[ForecastDay]] = None
