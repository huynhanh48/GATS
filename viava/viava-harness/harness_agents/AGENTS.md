# AGENTS.md — harness_agents/

Tầng runtime wiring — kết nối `core/` + `capabilities/` + `integrations/` + `tools/` thành agent hoàn chỉnh.

## Quy tắc

- Được import từ tất cả các layer (đặc quyền orchestration)
- **Không dùng `= None` defaults** trong `__init__` — dependency explicit, kiểu pipeline, truyền hết qua constructor
- Tất cả đều async
- **Cấu trúc đã đóng băng.** Không thêm module hoặc thư mục con mới. Chỉ được implement 3 thư mục trống hiện có: `hook/`, `permissions/`, `builtins/`

## Các component

| Component | Đường dẫn | Vai trò |
|-----------|-----------|---------|
| `AgentLoop` | `agent_loop/` | Async generator sinh stream events: `TextDelta`, `ToolExecutionStarted`, `ToolExecutionCompleted`, `TurnComplete`, `BackgroundTask*`. Flow: compact → prompt → stream LLM → execute tools → loop |
| `ToolEngine` | `tool/engine.py` | Facade: executor + guardrails + budget + optional `enabled_tool_names` filter |
| `ToolExecutor` | `tool/executor.py` | Thực thi tool song song qua `asyncio.gather`, timeout, cancel support |
| `Guardrails` | `tool/guardrails.py` | Phát hiện loop: lặp lỗi y hệt ≥3, cùng tool lỗi ≥5, read-only không progress ×3 |
| `BudgetStore` | `tool/budget_store.py` | Cắt ngắn kết quả: chars/lines mỗi kết quả, disk spill, tổng mỗi turn |
| `ModelTools` | `tool/model_tools.py` | Cầu nối: `get_tool_definitions()`, `handle_function_call()`, `check_tool_availability()` |
| `Context` | `context/` | Compaction 2 tầng: micro (cắt kết quả cũ) → full (LLM tóm tắt thành system note). Kích hoạt tại ngưỡng `context_window_tokens` |
| `SubAgentEngine` | `sub_agent/` | Chặn tool call `sub_agent_task`, chạy AgentLoop riêng (không qua ToolEngine) |
| `Persistence` | `persistence/` | Lưu session + message |
| `Prompt` | `prompt/` | Lắp ráp prompt và quản lý template |
| `Hooks` | `hook/` | MemoryProvider hooks (prefetch, sync_turn...) — để dành |
| `Permissions` | `permissions/` | `PermissionChecker` — chưa implement |
