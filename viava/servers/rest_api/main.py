from __future__ import annotations

import asyncio
import logging
import os
import sys
import time
import uuid
from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent.parent / "viava-harness"))

from dotenv import load_dotenv
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import Limiter
from slowapi.middleware import SlowAPIMiddleware
from slowapi.util import get_remote_address

from plugins.integrations.azure import (
    AzureOpenAIClient,
    AzureOpenAILLM,
    AzureSpeechToText,
)
from plugins.integrations.azure.embedding import AzureOpenAIEmbedding, AzureOpenAIEmbeddingClient
from plugins.integrations.json.doc_status import JsonDocStatusStorage
from plugins.integrations.json.store import JsonStore
from plugins.integrations.local.file_extractor import LocalFileExtractor
from plugins.integrations.networkx.graph_storage import NetworkXGraphStorage
from plugins.integrations.qdrant.vector_storage import QdrantVectorStorage
from plugins.integrations.tavily import TavilyWebSearch
from plugins.logic.chunk_strategy.rule_based import FixedTokenChunkStrategy
from plugins.logic.course_exercises import LLMCourseGenerator
from plugins.logic.openie.llm_extractor import LLMExtractor
from plugins.logic.retrieval_augmented_generation.graph_rag import GraphRAG
from plugins.logic.teaching import LLMTeaching
from servers.rest_api.exceptions import AppError
from servers.rest_api.routers import exercises as exercises_router
from servers.rest_api.routers import info as info_router
from servers.rest_api.routers import learning_path as learning_path_router
from servers.rest_api.routers import teaching as teaching_router
from servers.rest_api.routers import chat as chat_router
from servers.rest_api.schemas.common import ErrorDetail

load_dotenv()

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger(__name__)

RAG_WORK_DIR = os.getenv("RAG_WORK_DIR", "./rag_data")


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    logger.info("Khoi tao Azure OpenAI client (deployment=%s)", os.environ.get("AZURE_OPENAI_DEPLOYMENT"))
    client = AzureOpenAIClient(
        api_key=os.environ["AZURE_OPENAI_API_KEY"],
        azure_endpoint=os.environ["AZURE_OPENAI_ENDPOINT"],
        deployment=os.environ["AZURE_OPENAI_DEPLOYMENT"],
        api_version=os.environ.get("AZURE_OPENAI_API_VERSION", "2024-10-21"),
        timeout=300.0,
    )
    llm = AzureOpenAILLM(client)

    logger.info("Khoi tao Embedding (deployment=%s)", os.getenv("AZURE_OPENAI_EMBEDDING_DEPLOYMENT", "text-embedding-3-small"))
    embedding_client = AzureOpenAIEmbeddingClient(
        deployment=os.getenv("AZURE_OPENAI_EMBEDDING_DEPLOYMENT", "text-embedding-3-small"),
        api_key=os.environ["AZURE_OPENAI_API_KEY"],
        azure_endpoint=os.environ["AZURE_OPENAI_ENDPOINT"],
        api_version=os.environ.get("AZURE_OPENAI_API_VERSION", "2024-10-21"),
    )
    embedding = AzureOpenAIEmbedding(embedding_client)

    os.makedirs(RAG_WORK_DIR, exist_ok=True)

    def _vdb(namespace: str) -> QdrantVectorStorage:
        qdrant_url = os.getenv("QDRANT_URL", "")
        qdrant_api_key = os.getenv("QDRANT_API_KEY", "")
        if qdrant_url:
            return QdrantVectorStorage(
                embedding=embedding,
                namespace=namespace,
                url=qdrant_url,
                api_key=qdrant_api_key,
            )
        qdrant_path = os.path.join(RAG_WORK_DIR, "qdrant", namespace)
        return QdrantVectorStorage(
            embedding=embedding,
            namespace=namespace,
            path=qdrant_path,
        )

    logger.info("Khoi tao RAG (Qdrant URL=%s)", os.getenv("QDRANT_URL", "local"))
    rag = GraphRAG(
        llm=llm,
        extractor=LLMExtractor(llm),
        embedding=embedding,
        entities_vdb=_vdb("entities"),
        relationships_vdb=_vdb("relationships"),
        chunks_vdb=_vdb("chunks"),
        chunk_strategy=FixedTokenChunkStrategy(chunk_token_size=1200, chunk_overlap=100),
        graph=NetworkXGraphStorage(namespace="rag_graph", working_dir=RAG_WORK_DIR),
        full_docs=JsonStore(namespace="full_docs", base_dir=RAG_WORK_DIR),
        text_chunks=JsonStore(namespace="text_chunks", base_dir=RAG_WORK_DIR),
        entity_chunks=JsonStore(namespace="entity_chunks", base_dir=RAG_WORK_DIR),
        relation_chunks=JsonStore(namespace="relation_chunks", base_dir=RAG_WORK_DIR),
        full_entities=JsonStore(namespace="full_entities", base_dir=RAG_WORK_DIR),
        full_relations=JsonStore(namespace="full_relations", base_dir=RAG_WORK_DIR),
        doc_status=JsonDocStatusStorage(namespace="doc_status", base_dir=RAG_WORK_DIR),
    )
    await rag.initialize()

    logger.info("Khoi tao CourseGenerator")
    generator = LLMCourseGenerator(llm, rag)

    logger.info("Khoi tao Teaching")
    teaching = LLMTeaching(llm)

    logger.info("Khoi tao FileExtractor")
    extractor = LocalFileExtractor()
    logger.info("FileExtractor ho tro dinh dang: %s", ", ".join(extractor.supported_formats))

    logger.info("Khoi tao Transcriber (deployment=%s)", os.environ.get("AZURE_TRANSCRIBE_DEPLOYMENT", "gpt-4o-mini-transcribe"))
    transcriber = AzureSpeechToText(
        api_key=os.environ["AZURE_OPENAI_TRANSCRIBE_API_KEY"],
        base_url=os.environ["AZURE_OPENAI_TRANSCRIBE_ENDPOINT"],
        deployment=os.environ.get("AZURE_TRANSCRIBE_DEPLOYMENT", "gpt-4o-mini-transcribe"),
        language="vi",
        api_version="2025-01-01-preview",
    )

    logger.info("Khoi tao WebSearch (Tavily)")
    web_search = TavilyWebSearch(api_key=os.environ.get("TAVILY_API_KEY", ""))

    app.state.generator = generator
    app.state.teaching = teaching
    app.state.extractor = extractor
    app.state.transcriber = transcriber
    app.state.web_search = web_search
    app.state.llm_client = client
    app.state.rag = rag

    logger.info("Server san sang nhan request")
    yield

    logger.info("Dang dong RAG...")
    try:
        await asyncio.wait_for(rag.finalize(), timeout=10.0)
    except TimeoutError:
        logger.warning("RAG finalize timeout — tiep tuc shutdown")
    except Exception as e:
        logger.warning("Loi khi dong RAG: %s", e)

    logger.info("Dang dong client...")
    for coro in [llm.close(), client.close()]:
        try:
            await asyncio.wait_for(coro, timeout=5.0)
        except (TimeoutError, Exception) as e:
            logger.warning("Client close timeout/loi: %s", e)

    logger.info("Da dong ket noi")


app = FastAPI(
    title="viava Course API",
    description=(
        "API sinh nội dung khóa học thông minh sử dụng Azure OpenAI + GraphRAG.\n\n"
        "**Tính năng chính:**\n"
        "- Sinh lộ trình học tập từ file/URL/text\n"
        "- Sinh 8 loại bài tập (MCQ, short answer, fill-in-blank, true/false, matching, ordering, coding, flashcard)\n"
        "- Chatbot RAG hỏi đáp dựa trên knowledge graph\n"
        "- Đánh giá, giải thích, tóm tắt nội dung"
    ),
    version="2.0.0",
    lifespan=lifespan,
)

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_middleware(SlowAPIMiddleware)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def add_request_id(request: Request, call_next):
    request_id = str(uuid.uuid4())
    request.state.request_id = request_id
    response = await call_next(request)
    response.headers["X-Request-ID"] = request_id
    return response


@app.middleware("http")
async def log_requests(request: Request, call_next):
    start = time.time()
    response = await call_next(request)
    duration = (time.time() - start) * 1000
    logger.info("%s %s %d %.0fms", request.method, request.url.path, response.status_code, duration)
    return response


@app.get(
    "/health",
    summary="Kiểm tra trạng thái server",
    description="Trả về trạng thái hiện tại của server. Dùng để health check hoặc monitoring.",
)
async def health():
    return {"status": "ok"}


app.include_router(info_router.router)
app.include_router(learning_path_router.router)
app.include_router(exercises_router.router)
app.include_router(teaching_router.router)
app.include_router(chat_router.router)


@app.exception_handler(AppError)
async def app_error_handler(request: Request, exc: AppError) -> JSONResponse:
    status_map = {
        "VALIDATION_ERROR": 400,
        "NO_INPUT": 400,
        "MULTIPLE_INPUTS": 400,
        "UNSUPPORTED_FORMAT": 400,
        "FETCH_FAILED": 400,
        "TRANSCRIBE_FAILED": 500,
        "EXTRACT_FAILED": 422,
        "GENERATION_FAILED": 500,
        "CONTENT_EMPTY": 422,
        "CONTENT_TOO_LONG": 413,
    }
    status_code = status_map.get(exc.code, 500)
    return JSONResponse(
        status_code=status_code,
        content={"detail": ErrorDetail(code=exc.code, message=exc.message, details=exc.details).model_dump()},
    )


@app.exception_handler(ValueError)
async def validation_error_handler(request: Request, exc: ValueError) -> JSONResponse:
    return JSONResponse(
        status_code=400,
        content={"detail": ErrorDetail(code="VALIDATION_ERROR", message=str(exc)).model_dump()},
    )


@app.exception_handler(Exception)
async def general_error_handler(request: Request, exc: Exception) -> JSONResponse:
    return JSONResponse(
        status_code=500,
        content={"detail": ErrorDetail(code="GENERATION_FAILED", message="Loi khi sinh noi dung khoa hoc", details=str(exc)).model_dump()},
    )
