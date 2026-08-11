# AGENTS.md — tools/

Thư viện tool — các function object mà LLM có thể gọi. Hệ thống tool kiểu hermes-agent.

## Quy tắc

- Import từ `core/` và `capabilities/` **duy nhất** — **không được import từ `integrations/` hoặc `harness_agents/`**
- Mỗi toolset = một thư mục con, có `__init__.py`
- `registry.py` — singleton `ToolRegistry` (register, deregister, dispatch, get_definitions)
- `factory.py` — `create_and_register_all_tools()` nhận optional backends, đăng ký có điều kiện
- `toolsets.py` — `ToolsetDef` với composition qua `includes:`

## Mẫu tool (Tool pattern)

1. Định nghĩa `Args` là pydantic `BaseModel`
2. Kế thừa `ToolBase[Args]` — gán class attributes: `name`, `toolset`, `description`, optional `emoji`
3. Inject backend qua `__init__` (constructor DI)
4. Override `is_available()` → trả về `backend is not None`
5. `get_args_tool()` trả về class Args (hoặc `None` nếu không cần args)
6. `async execute(context: ToolContext, args: Args) -> ToolResult`

Mô tả tool và prompt bằng tiếng Việt. Đăng ký lúc startup qua `factory.py`, không đăng ký lúc import.

## Toolsets

| Toolset | Thư mục | Tools |
|---------|----------|-------|
| `file` | `file/` | read_file, write_file, edit_file, list_files, search_files, bash |
| `web` | `web/` | web_search, web_fetch |
| `memory` | `memory/` | save_tool_usage, search_tool_usage, save_text |
| `mcp` | `mcp/` | list_resources, read_resource, adapter |
| `sql` | `sql/` | run_sql, text_to_sql, schema_train |
| `agent` | `agent/` | sub_agent_task |
| `time` | `time/` | current_time |
| `weather` | `weather/` | weather |
| `hipporag` | `hipporag/` | hipporag_ingest, hipporag_search, hipporag_delete, hipporag_list |
| `coding` | (composite) | includes: file + web + sql + time |
