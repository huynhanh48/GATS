# AGENTS.md — viava

Hai phần chính trong repo này:

- **`viava-harness/`** — library: multi-agent LLM orchestration framework (Pydantic ABCs + Azure OpenAI plugins)
- **`servers/rest_api/`** — FastAPI server: wrap course_gen capability thành REST API

---

## Dependencies

`requirements.txt` — một danh sách phẳng, không có extras. Không có `pyproject.toml`, Poetry, hay Pipenv.

Dev tools (`ruff`, `mypy`, `pytest`, `pre-commit`) bị **comment out** — không chạy được. Chỉ có pytest đã được cài thủ công.

---

## Layer Architecture (viava-harness)

Import one-way, từ trong ra ngoài:

```
utils/  →  core/  →  capabilities/  →  plugins/  →  tools/  →  harness_agents/
```

- Mỗi package trong `core/` và `capabilities/` **bắt buộc** 3 file: `__init__.py` + `models.py` (Pydantic) + `base.py` (ABC)
- `plugins/integrations/` = provider (gọi API provider trực tiếp: Azure, Qdrant, MinIO...)
- `plugins/logic/` = technique (orchestrate, DI các ABC từ core, không gọi provider trực tiếp)
- Chi tiết layer rules có trong từng `AGENTS.md` ở mỗi thư mục của `viava-harness/`

---

## Servers (`servers/rest_api/`)

### Import path quirk

`servers/rest_api/main.py` tự chèn `viava-harness/` vào `sys.path`:

```python
sys.path.insert(0, str(Path(__file__).resolve().parent.parent.parent / "viava-harness"))
```

Khi chạy server hoặc test từ **repo root**, path này giải quyết đúng. Tất cả code trong `servers/` import từ `viava-harness` như top-level package (`from capabilities.course_gen import ...`).

### Chạy server

```bash
cd viava
python -m uvicorn servers.rest_api.main:app --host 0.0.0.0 --port 8000
```

Cần `.env` ở repo root với Azure OpenAI credentials.

### Chạy tests

```bash
cd viava
python -m pytest servers/rest_api/tests/ -v
```

Test dùng `Fake*` implementations (không gọi Azure thật). Test qua `TestClient` với `dependency_overrides`.

### Structure

```
servers/rest_api/
├── main.py          # FastAPI app + lifespan (DI singletons)
├── dependencies.py  # FastAPI Depends() functions
├── exceptions.py    # AppError(code, message, details)
├── routers/         # APIRouter endpoints
├── schemas/         # Pydantic request/response models
├── services/        # Business logic (orchestration layer)
├── tests/           # pytest tests (Fake* backends)
├── configs/         # (chưa dùng)
├── database/        # (chưa dùng)
└── models/          # (chưa dùng)
```

### DI flow

```
lifespan (main.py)
  └─ khởi tạo AzureOpenAIClient → LLMCourseGenerator, LocalFileExtractor, AzureSpeechToText
     └─ gắn vào app.state

dependencies.py
  └─ get_service() → CourseGenService(generator, extractor, transcriber)

routers/course_gen.py
  └─ Depends(get_service) → gọi service.generate()
```

---

## Recent Changes

- **`AzureLLMCourseGenerator`** bị xóa khỏi `plugins/integrations/azure/`, dời sang `plugins/logic/course_gen/` với tên **`LLMCourseGenerator`** (constructor: `__init__(self, llm: BaseLLM)`, không còn param `max_concurrent`)
- Các prompt cũng dời từ `plugins/integrations/azure/course_gen_prompts/` → `plugins/logic/course_gen/prompts.py`
- `AzureLLMTeaching` và `teaching_prompts/` cũng bị xóa khỏi `plugins/integrations/azure/`, dời sang `plugins/logic/teaching/`

---

## Quy ước

- **Tiếng Việt** cho tất cả prompt, log message, error message, field descriptions
- **Constructor DI** — không dùng raw config string, inject backend typed
- **No DB in server** — server hiện tại stateless, không lưu kết quả
- **100K char limit** — content quá dài bị reject với HTTP 413
- **No CI/CD** — không có GitHub Actions, Dockerfile, hay Makefile
