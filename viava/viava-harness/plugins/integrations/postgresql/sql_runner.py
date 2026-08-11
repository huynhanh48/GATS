"""PostgreSQL implementation of SQLRunner interface."""

from __future__ import annotations

import logging
from typing import Any, Dict, Optional

import pandas as pd

from capabilities.sql_runner import SQLRunner, RunSQLToolArgs
from core.tool import ToolContext

logger = logging.getLogger(__name__)


class PostgresRunner(SQLRunner):
    """PostgreSQL implementation of the SQLRunner interface."""

    def __init__(
        self,
        connection_string: Optional[str] = None,
        host: Optional[str] = None,
        port: int = 5432,
        database: Optional[str] = None,
        user: Optional[str] = None,
        password: Optional[str] = None,
        **kwargs: Any,
    ) -> None:
        try:
            import psycopg2
            import psycopg2.extras

            self._psycopg2 = psycopg2
        except ImportError as e:
            raise ImportError(
                "psycopg2 package is required. Install with: pip install psycopg2-binary"
            ) from e

        if connection_string:
            self._connection_string = connection_string
            self._connection_params = None
        elif host and database and user:
            self._connection_string = None
            self._connection_params = {
                "host": host,
                "port": port,
                "database": database,
                "user": user,
                "password": password,
                **kwargs,
            }
        else:
            raise ValueError(
                "Either provide connection_string OR (host, database, and user) parameters"
            )

    async def run_sql(self, args: RunSQLToolArgs, context: ToolContext) -> pd.DataFrame:
        psycopg2 = self._psycopg2

        if self._connection_string:
            conn = psycopg2.connect(self._connection_string)
        else:
            conn = psycopg2.connect(**self._connection_params)

        cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

        try:
            cursor.execute(args.sql_query)

            query_type = args.sql_query.strip().upper().split()[0]

            if query_type == "SELECT":
                rows = cursor.fetchall()
                if not rows:
                    return pd.DataFrame()

                results_data = [dict(row) for row in rows]
                return pd.DataFrame(results_data)
            else:
                conn.commit()
                rows_affected = cursor.rowcount
                return pd.DataFrame({"rows_affected": [rows_affected]})

        except Exception:
            conn.rollback()
            raise
        finally:
            cursor.close()
            conn.close()
