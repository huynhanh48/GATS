from typing import Any

from .base import PromptBase


SQL_SYSTEM_PROMPT = """\
Bạn là một chuyên gia tạo câu lệnh SQL cho cơ sở dữ liệu PostgreSQL.

Dựa trên câu hỏi bằng ngôn ngữ tự nhiên và thông tin schema của cơ sở dữ liệu \
được cung cấp, hãy tạo một câu lệnh SQL chính xác.

Yêu cầu:
- Chỉ sử dụng các bảng và cột có trong schema được cung cấp.
- Ưu tiên sử dụng JOIN thay cho subquery khi phù hợp.
- Luôn sử dụng bí danh (alias) cho bảng và định danh đầy đủ tên cột (ví dụ: u.name).
- Chỉ trả về một câu lệnh SQL duy nhất.
- Đặt câu lệnh SQL trong khối mã Markdown theo định dạng ```sql ... ```.
- Sau khối mã SQL, giải thích ngắn gọn ý nghĩa của câu lệnh.
- Sử dụng cú pháp của PostgreSQL.
"""


class SqlPrompt(PromptBase):
    name: str = "sql"
    description: str = "Prompt cho Text-to-SQL: sinh SQL từ natural language + schema"

    async def render(
        self,
        question: str = "",
        ddl: list[str] | None = None,
        docs: list[str] | None = None,
        examples: list[dict] | None = None,
        **kwargs: Any,
    ) -> str:
        parts = [SQL_SYSTEM_PROMPT, ""]

        if ddl:
            parts.append("## Database Schema (DDL)")
            for d in ddl:
                parts.append(d)
            parts.append("")

        if docs:
            parts.append("## Business Documentation")
            for d in docs:
                parts.append(d)
            parts.append("")

        if examples:
            parts.append("## Example Queries")
            for ex in examples:
                parts.append(f"Question: {ex['question']}")
                parts.append(f"SQL: {ex['sql']}")
                parts.append("")

        parts.append("## User Question")
        parts.append(question)
        parts.append("")
        parts.append("Generate the SQL query:")

        return "\n".join(parts)


class SqlFixPrompt(PromptBase):
    name: str = "sql_fix"
    description: str = "Prompt sửa lỗi SQL"

    async def render(
        self,
        bad_sql: str = "",
        error_message: str = "",
        **kwargs: Any,
    ) -> str:
        return (
            f"The following SQL query has an error:\n\n"
            f"Error: {error_message}\n\n"
            f"SQL:\n\n"
            f"```sql\n{bad_sql}\n```"
        )