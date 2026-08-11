# AGENTS.md — utils/

Hàm tiện ích không trạng thái (stateless helper functions). Không phụ thuộc vào project packages.

## Quy tắc

- Code utility thuần túy — không import từ `core/`, `capabilities/`, `integrations/`, `tools/`, `harness_agents/`
- Không dùng class có trạng thái — chỉ dùng function
- Có thể import từ bất kỳ đâu

## Các module

| Module | Mục đích |
|--------|----------|
| `paths.py` | Đường dẫn dữ liệu session/user trong `~/.harness-agents/` |
| `platform.py` | Phát hiện OS: Windows / Linux / macOS / WSL |
| `terminal.py` | Helper xuất ra terminal |
| `text_to_sql_validator.py` | Helper validate SQL |
