from __future__ import annotations

from pydantic import BaseModel

from core.sql_knowledge_base import SqlKnowledgeBase
from core.sql_generator import SqlGenerator
from core.tool import ToolBase, ToolContext, ToolResult

from harness_agents.prompt.sql import SqlFixPrompt # sai clean architecture

from utils.text_to_sql_validator import normalize_sql, validate_sql

from capabilities.sql_runner import SQLRunner


class TextToSQLArgs(BaseModel):
    natural_language: str
    execute: bool = False
    max_retries: int = 3


class TextToSQLTool(ToolBase[TextToSQLArgs]):
    name = "text_to_sql"
    toolset = "sql"
    description = "Convert natural language to SQL query"

    def __init__(
        self,
        knowledge_base: SqlKnowledgeBase,
        sql_generator: SqlGenerator,
        domain: str = "default",
        sql_runner: SQLRunner | None = None,
        name: str = "text_to_sql",
        description: str = "Convert natural language to SQL query",
    ):
        self._name = name
        self._description = description
        self._kb = knowledge_base
        self._sql_gen = sql_generator
        self._domain = domain
        self._sql_runner = sql_runner

    def is_available(self) -> bool:
        return self._kb is not None and self._sql_gen is not None

    @property
    def name(self) -> str:
        return self._name

    @property
    def description(self) -> str:
        return self._description

    def get_args_tool(self) -> type[TextToSQLArgs]:
        return TextToSQLArgs

    async def execute(self, context: ToolContext, args: TextToSQLArgs) -> ToolResult:
        try:
            kb_result = await self._kb.query(
                args.natural_language, filter={"domain": self._domain}
            )
            sql_output = await self._sql_gen.generate(
                question=args.natural_language,
                tables=kb_result.tables,
                additional_context=kb_result.additional_context,
                question_sql_pairs=kb_result.question_sql_pairs,
            )
            sql = _extract_sql(sql_output.sql)
            sql = normalize_sql(sql)
            retry_count = 0
            for _ in range(args.max_retries):
                error = validate_sql(sql)
                if error is None:
                    break
                retry_count += 1
                fix_prompt_builder = SqlFixPrompt(name="sql_fix")
                fix_prompt = await fix_prompt_builder.render(bad_sql=sql, error_message=error)
                sql_output = await self._sql_gen.generate(
                    question=fix_prompt, tables=kb_result.tables,
                    additional_context=kb_result.additional_context,
                    question_sql_pairs=kb_result.question_sql_pairs,
                )
                sql = _extract_sql(sql_output.sql)
                sql = normalize_sql(sql)
            output = f"```sql\n{sql}\n```\n\n**Explanation:** {sql_output.explanation}\n"
            metadata = {"sql": sql, "retry_count": retry_count}
            if args.execute and self._sql_runner:
                try:
                    from capabilities.sql_runner import RunSQLToolArgs
                    df = await self._sql_runner.run_sql(RunSQLToolArgs(sql_query=sql), context)
                    row_count = len(df)
                    if row_count > 0:
                        preview = df.to_csv(index=False)
                        if len(preview) > 1500:
                            preview = preview[:1500] + "\n(Results truncated to 1500 characters)"
                        output += f"\n\n**Results ({self._domain}):** ({row_count} rows)\n```\n{preview}\n```"
                    else:
                        output += f"\n\n**Results ({self._domain}):** 0 rows"
                    metadata["row_count"] = row_count
                    metadata["database"] = self._domain
                except Exception as e:
                    output += f"\n\n**Execution error:** {e}"
                    metadata["execution_error"] = str(e)
            return ToolResult(result=output, success=True, metadata=metadata)
        except Exception as e:
            return ToolResult(
                result=f"SQL generation failed: {e}", success=False,
                metadata={"error_type": "sql_generation_error"},
            )


def _extract_sql(text: str) -> str:
    import re
    match = re.search(r"```sql\s*\r?\n(.*?)\r?\n```", text, re.DOTALL | re.IGNORECASE)
    if match:
        return match.group(1).strip()
    kw_match = re.search(r"\b(SELECT|WITH|INSERT|UPDATE|DELETE|CREATE|ALTER|DROP)\b", text, re.IGNORECASE)
    if kw_match:
        return text[kw_match.start():].strip()
    return text.strip()
