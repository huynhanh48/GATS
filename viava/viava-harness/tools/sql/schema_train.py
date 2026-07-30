import re
from typing import Literal

from pydantic import BaseModel

from core.tool import ToolBase, ToolContext, ToolResult


class SchemaTrainInput(BaseModel):
    type: Literal["ddl", "documentation", "sql_example"]
    content: str
    question: str | None = None


_TABLE_NAME_RE = re.compile(r"CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?(\w+)", re.IGNORECASE)


def extract_table_name(ddl: str) -> str:
    match = _TABLE_NAME_RE.search(ddl)
    return match.group(1) if match else ""


class SchemaTrainTool(ToolBase[SchemaTrainInput]):
    name = "schema_train"
    toolset = "sql"
    description = "Train the Text-to-SQL system with DDL, documentation, or SQL example queries."

    def __init__(self, schema_store):
        self._schema_store = schema_store

    def is_available(self) -> bool:
        return self._schema_store is not None

    def get_args_tool(self) -> type[SchemaTrainInput]:
        return SchemaTrainInput

    async def execute(self, context: ToolContext, args: SchemaTrainInput) -> ToolResult:
        try:
            if args.type == "ddl":
                table_name = extract_table_name(args.content)
                point_id = await self._schema_store.ingest_ddl(args.content, table_name)
                return ToolResult(result=f"DDL stored. Point ID: `{point_id}` (table: {table_name})", success=True)
            elif args.type == "documentation":
                point_id = await self._schema_store.ingest_documentation(args.content)
                return ToolResult(result=f"Documentation stored. Point ID: `{point_id}`", success=True)
            elif args.type == "sql_example":
                question = args.question or "No question provided"
                point_id = await self._schema_store.ingest_example(question, args.content)
                return ToolResult(result=f"SQL example stored. Point ID: `{point_id}`", success=True)
        except Exception as e:
            return ToolResult(result=f"Schema training failed: {e}", success=False,
                              metadata={"error_type": "schema_train_error"})
