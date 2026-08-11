# AGENTS.md — plugins/

Plugin system chia làm **2 phần** độc lập:

```
plugins/
├── integrations/   ← Provider: implementation gọi API của 1 công nghệ/nhà cung cấp
└── logic/          ← Technique: thuật toán orchestrate nhiều capability qua constructor DI
```

---

## 1. `integrations/` — Provider

Cài đặt cụ thể gọi trực tiếp API/SDK của provider. Implement 1+ ABC từ `core/` hoặc `capabilities/`.

| Thư mục | Provider | Implement |
|----------|----------|-----------|
| `azure/` | Azure OpenAI + Cohere | `AzureOpenAILLM`, `AzureOpenAIEmbedding`, `AzureCohereReranker`, `AzureExtractor`, `AzureBatchProcessor`, `AzureDocumentIntelligence`, `AzureSpeechToText`, `AzureLLMTeaching`, `AzureLLMCourseGenerator` |
| `azure_no_cache/` | Azure OpenAI (no cache) | `AzureOpenAILLM`, `AzureOpenAIEmbedding`, `AzureCohereReranker` (subset of `azure/`) |
| `ddgs/` | DuckDuckGo Search | `DuckDuckGoWebSearch` |
| `http/` | HTTP | `HttpMCPClient`, `HttpWebFetch` |
| `json/` | JSON files | `JsonSessionStore` |
| `local/` | Local filesystem / in-process | `LocalFileSystem`, `LocalMCPClient`, `LocalFileExtractor`, `LocalMediaService` |
| `minio/` | MinIO S3 | `MinioFileSystem` |
| `networkx/` | NetworkX | `NetworkXGraphStorage` |
| `postgresql/` | PostgreSQL | `PostgresRunner` |
| `qdrant/` | Qdrant Vector DB | `QdrantVectorStorage`, `QdrantAgentMemory` |
| `sqlite/` | SQLite | `SqliteSessionStore` |
| `tavily/` | Tavily Search API | `TavilyWebSearch` |
| `weatherapi/` | WeatherAPI.com | `WeatherAPIWeather` |

### Quy tắc

- Tên thư mục = tên công nghệ/nhà cung cấp
- Gọi trực tiếp API/SDK — không abstract thêm lớp
- Constructor DI — inject backend typed, không nhận raw config string

---

## 2. `logic/` — Technique

Thuật toán orchestrate nhiều capability qua constructor DI. Không gọi provider trực tiếp.

| Thư mục | Kỹ thuật | Export |
|----------|----------|--------|
| `chunk_strategy/` | Chunk strategies (7 loại) | `FixedSizeChunkStrategy`, `SlidingWindowChunkStrategy`, `SentenceChunkStrategy`, `ParagraphChunkStrategy`, `PageChunkStrategy`, `HeaderChunkStrategy`, `RecursiveChunkStrategy`, `SectionHeaderChunkStrategy`, `DocumentAwareChunkStrategy`, `TableAwareChunkStrategy`, `SemanticChunkStrategy`, `LLMBasedChunkStrategy`, `CodeAwareChunkStrategy`, `ASTBasedChunkStrategy`, `GraphAwareChunkStrategy` |
| `retrieval_augmented_generation/` | Graph RAG | `GraphRAG` |

### Quy tắc

- Tên thư mục = tên kỹ thuật/thuật toán
- Implement 1 ABC từ `capabilities/`
- **Không gọi provider** — mọi dependency nhận qua constructor DI dưới dạng ABC từ `core/`
- Không import chéo giữa các logic directory

---

## Chung

- `__init__.py` re-export class public
- Constructor DI — inject backend typed
