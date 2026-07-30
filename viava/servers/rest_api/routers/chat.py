from __future__ import annotations

import logging

from fastapi import APIRouter, Body, Depends, Request

from servers.rest_api.schemas.chat import ChatRequest, ChatResponse
from servers.rest_api.services.chatbot_service import ChatbotService

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/course", tags=["Chatbot"])


def get_chatbot_service(request: Request) -> ChatbotService:
    return ChatbotService(rag=request.app.state.rag)


@router.post(
    "/chat",
    response_model=ChatResponse,
    summary="Chatbot RAG — hỏi đáp dựa trên knowledge graph",
    description=(
        "Trả lời câu hỏi của người dùng bằng cách sử dụng GraphRAG để truy xuất "
        "ngữ cảnh liên quan từ knowledge graph đã ingest, sau đó dùng LLM sinh câu trả lời.\n\n"
        "**Domains (tùy chọn):** Lọc kết quả retrieval theo danh sách domain. "
        "Nếu để None, tìm kiếm trên toàn bộ knowledge graph. "
        "Việc lọc domain giúp câu trả lời chính xác và phù hợp với lĩnh vực cụ thể.\n\n"
        "**Quy trình:**\n"
        "1. Embedding query → Qdrant vector search → lấy candidate chunks\n"
        "2. Rerank (nếu có reranker) → lấy top chunks\n"
        "3. LLM sinh câu trả lời từ context + query\n"
        "4. Trả về câu trả lời + danh sách nguồn tham khảo"
    ),
)
async def chat(
    req: ChatRequest = Body(),
    svc: ChatbotService = Depends(get_chatbot_service),
) -> ChatResponse:
    logger.info("POST /course/chat")
    answer, refs = await svc.chat(req.query, req.domains)
    return ChatResponse(answer=answer, references=refs)
