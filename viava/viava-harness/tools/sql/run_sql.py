from __future__ import annotations

import logging
from typing import Type

from capabilities.sql_runner import SQLRunner, RunSQLToolArgs
from core.tool import ToolBase, ToolContext, ToolResult

logger = logging.getLogger(__name__)


class RunSQLTool(ToolBase[RunSQLToolArgs]):
    name = "run_sql"
    toolset = "sql"
    description = "Execute SQL queries"

    def __init__(self, sql_runner: SQLRunner, name: str = "run_sql", description: str = "Execute SQL queries") -> None:
        self._name = name
        self._description = description
        self._sql_runner = sql_runner

    @property
    def name(self) -> str:
        return self._name

    @property
    def description(self) -> str:
        return self._description

    def is_available(self) -> bool:
        return self._sql_runner is not None

    def get_args_tool(self) -> Type[RunSQLToolArgs]:
        return RunSQLToolArgs

    async def execute(self, context: ToolContext, args: RunSQLToolArgs) -> ToolResult:
        try:
            df = await self._sql_runner.run_sql(args, context)
            query_type = args.sql_query.strip().upper().split()[0]
            if query_type == "SELECT":
                if df.empty:
                    return ToolResult(success=True, result="Query executed successfully. No rows returned.",
                                      metadata={"row_count": 0, "columns": [], "query_type": query_type})
                csv_preview = df.to_csv(index=False)
                return ToolResult(success=True, result=csv_preview,
                                  metadata={"row_count": len(df), "columns": df.columns.tolist(),
                                            "query_type": query_type, "results": df.to_dict("records")})
            else:
                rows_affected = len(df) if not df.empty else 0
                return ToolResult(success=True, result=f"Query executed successfully. {rows_affected} row(s) affected.",
                                  metadata={"rows_affected": rows_affected, "query_type": query_type})
        except Exception as e:
            logger.exception("run_sql failed")
            return ToolResult(success=False, result=f"Error executing query: {e}", error=str(e),
                              metadata={"error_type": "sql_error"})
