from abc import ABC, abstractmethod
import pandas as pd


from core.tool import ToolContext
from .models import RunSQLToolArgs


class SQLRunner(ABC):

    @abstractmethod
    async def run_sql(
        self, args: RunSQLToolArgs, context: ToolContext
    ) -> pd.DataFrame:
        pass