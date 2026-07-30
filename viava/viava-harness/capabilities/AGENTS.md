# AGENTS.md — capabilities/

Tầng interface trừu tượng. Chỉ chứa ABC + models, không chứa implementation. Mỗi capability là một package độc lập.

## Quy tắc

- **Import từ `core/`** — không import từ `integrations/`, `tools/`, `harness_agents/`, hoặc capability khác
- **`core/` KHÔNG được import từ `capabilities/`** — đây là quan hệ một chiều. Core nội bộ có thể import chéo lẫn nhau (vd `core.llm` → `core.tool`), nhưng layer ngoài không được đụng vào internals của core — chỉ gọi qua public API của core
- Mọi package **bắt buộc** phải có `__init__.py` + `models.py` + `base.py` (ngoại lệ: package chỉ có models nếu chưa có base)
- `models.py` định nghĩa pydantic `BaseModel` riêng cho capability — KHÔNG chỉ re-export từ core
- `base.py` định nghĩa `ABC` với `@abstractmethod` — là contract
- `base.py` **phải import và dùng** models từ `models.py`
- Không import chéo giữa các capability packages
- **Implementation nằm ở `integrations/`**: provider (gọi API trực tiếp) → `integrations/{provider}/`, technique (orchestrate qua DI) → `integrations/techniques/{name}/`

## Các package

| Package | ABC | Models | Implementation |
|---------|-----|--------|---------------|
| `web_search/` | `WebSearchBase` | `WebSearchItem`, `WebSearchResult` | `integrations/tavily/`, `integrations/ddgs/` |
| `web_fetch/` | `WebFetchBase` | `WebFetchItem` | `integrations/http/` |
| `current_time/` | `CurrentTimeBase` | `TimeResult` | — |
| `file_system/` | `FileSystem` | `FileSearchMatch`, `CommandResult` | `integrations/local/`, `integrations/minio/` |
| `weather/` | `WeatherBase` | `WeatherCondition`, `ForecastDay`, `WeatherResult` | `integrations/weatherapi/` |
| `text_to_sql/` | `TextToSQLGenerator` | `TextToSQLInput`, `TextToSQLOutput` | `integrations/azure/` |
| `mcp/` | `MCPGateway`, `MCPManager` | Server configs, `MCPConnectionStatus`, `MCPToolInfo`, `MCPResourceInfo` | `integrations/local/`, `integrations/http/` |
| `agent_memory/` | `AgentMemory` | `ToolMemory`, `TextMemory`, search result models, `MemoryStats` | `integrations/qdrant/` |
| `sql_runner/` | `SQLRunner` | `RunSQLToolArgs` | `integrations/postgresql/` |
| `information_extraction/` | `BaseExtractor` | `ExtractedEntity`, `ExtractedRelationship`, `ExtractionResult` | `integrations/azure/` |
| `rag/` | `BaseRAG` | `RAGDocument`, `DocChunk`, `RetrievalContext`, `RAGQueryResult` | `integrations/techniques/rag/` |
