from datetime import datetime
from typing import Any, Dict, List, Optional
import uuid

from core.tool import ToolContext

try:
    from qdrant_client import AsyncQdrantClient
    from qdrant_client.models import (
        Distance,
        VectorParams,
        PointStruct,
        Filter,
        FieldCondition,
        MatchValue,
        PointIdsList
    )

    QDRANT_AVAILABLE = True
except ImportError:
    QDRANT_AVAILABLE = False

from capabilities.agent_memory import (
    AgentMemory,
    TextMemory,
    TextMemorySearchResult,
    ToolMemory,
    ToolMemorySearchResult
)




class QdrantAgentMemory(AgentMemory):
    def __init__(
        self,
        dimension: int = 1536,
        collection_name: str = "tool_memories",
        url: Optional[str] = None,
        host: Optional[str] = None,
        port: Optional[int] = None,
        api_key: Optional[str] = None,
        prefer_grpc: bool = False,
        path: Optional[str] = None,
        location: Optional[str] = None,
    ):
        
        if not QDRANT_AVAILABLE:
            raise ImportError(
                "qdrant-client is not installed"
            )
        
        self._url = url
        self._host = host
        self._port = port 
        self._api_key = api_key
        self._prefer_grpc = prefer_grpc
        self._path = path
        self._location = location
        self.dimension = dimension
        self.collection_name = collection_name
        self._client: Optional[AsyncQdrantClient] = None
      

    async def _ensure_client(self) -> AsyncQdrantClient:
        if self._client is None:
            kwargs: dict[str, Any] = {
                "api_key": self._api_key or None,
                "prefer_grpc": self._prefer_grpc,
                "check_compatibility": False,
            }
            if self._location:
                kwargs["location"] = self._location
            elif self._path:
                kwargs["path"] = self._path
            elif self._url:
                kwargs["url"] = self._url
            else:
                kwargs["host"] = self._host
                kwargs["port"] = self._port
            self._client = AsyncQdrantClient(**kwargs)
        return self._client
    
    async def _ensure_collection(self) -> None:
        client = await self._ensure_client()
        exists = await client.collection_exists(self.collection_name)
        if not exists:
            await client.create_collection(
                collection_name=self.collection_name,
                vectors_config=VectorParams(
                    size=self.dimension,
                    distance=Distance.COSINE,
                ),
            )

        for field, schema in [("success", "bool"), ("tool_name", "keyword"), ("is_text_memory", "bool"), ("timestamp", "keyword")]:
            try:
                await client.create_payload_index(
                    collection_name=self.collection_name,
                    field_name=field,
                    field_schema=schema,
                )
            except Exception:
                pass

    def _create_embedding(self, text: str) -> List[float]:
        """Create a simple embedding from text (placeholder)."""
        import hashlib

        hash_val = int(hashlib.md5(text.encode()).hexdigest(), 16)
        return [(hash_val >> i) % 100 / 100.0 for i in range(self.dimension)]
    

    async def save_tool_usage(
        self,
        question: str,
        context: ToolContext, # Không có sử dụng 
        tool_name: str,
        args: Dict[str, Any],
        success: bool = True,
        metadata: Optional[Dict[str, Any]] = None,
    ) -> None:

        await self._ensure_collection()          # ← thêm
        client = await self._ensure_client()
        memory_id = str(uuid.uuid4())
        timestamp = datetime.now().isoformat()
        embedding = self._create_embedding(question)

        payload = {
            "question": question,
            "tool_name": tool_name,
            "args": args,
            "timestamp": timestamp,
            "success": success,
            "metadata": metadata or {},
        }

        point = PointStruct(id=memory_id, vector=embedding, payload=payload)

        await client.upsert(                       # await async
            collection_name=self.collection_name,
            points=[point]
        )
    
    async def search_similar_usage(
        self,
        question: str,
        context: ToolContext, # Không có sử dụng 
        *,
        limit: int = 10,
        similarity_threshold: float = 0.7,
        tool_name_filter: Optional[str] = None,
    ) -> List[ToolMemorySearchResult]:
        await self._ensure_collection()          # ← thêm
        client = await self._ensure_client()
        embedding = self._create_embedding(question)
        query_filter = None
        conditions = [FieldCondition(key="success", match=MatchValue(value=True))]


        if tool_name_filter:
            conditions.append(
                FieldCondition(
                    key="tool_name", match=MatchValue(value=tool_name_filter)
                )
            )

        if conditions:
            query_filter = Filter(must=conditions)

        
        
        results = await client.query_points(
            collection_name=self.collection_name,
            query=embedding,
            limit=limit,
            query_filter=query_filter,
            score_threshold=similarity_threshold,
        )

        search_results = []
        
        for i, hit in enumerate(results.points):
                payload = hit.payload

                memory = ToolMemory(
                    memory_id=str(hit.id),
                    question=payload["question"],
                    tool_name=payload["tool_name"],
                    args=payload["args"],
                    timestamp=payload.get("timestamp"),
                    success=payload.get("success", True),
                    metadata=payload.get("metadata", {}),
                )

                search_results.append(
                    ToolMemorySearchResult(
                        memory=memory, similarity_score=hit.score, rank=i + 1
                    )
                )

        return search_results
    
    async def get_recent_memories(
        self, context: ToolContext, limit: int = 10
    ) -> List[ToolMemory]:
        await self._ensure_collection()          # ← thêm
        client = await self._ensure_client()

        points, _ = await client.scroll(
            collection_name=self.collection_name,
            limit=1000,
            with_payload=True,
            with_vectors=False,
        )

        # Sort by timestamp
        sorted_points = sorted(
            points, key=lambda p: p.payload.get("timestamp", ""), reverse=True
        )


        memories = []
        for point in sorted_points[:limit]:
            payload = point.payload

            # Skip text memories - they have is_text_memory flag
            if payload.get("is_text_memory"):
                continue

            memory = ToolMemory(
                memory_id=str(point.id),
                question=payload["question"],
                tool_name=payload["tool_name"],
                args=payload["args"],
                timestamp=payload.get("timestamp"),
                success=payload.get("success", True),
                metadata=payload.get("metadata", {}),
            )
            memories.append(memory)

        return memories
        
    async def delete_by_id(self, context: ToolContext, memory_id: str) -> bool:
        await self._ensure_collection()          # ← thêm
        client = await self._ensure_client()
        try:
            # Check if the point exists before attempting to delete
            points = await client.retrieve(
                collection_name=self.collection_name,
                ids=[memory_id],
                with_payload=False,
                with_vectors=False,
            )

            if points and len(points) > 0:
                await client.delete(
                    collection_name=self.collection_name,
                    points_selector=PointIdsList(points=[memory_id]),
                )
                return True
            return False
        except Exception:
            return False
    
    async def save_text_memory(self, content: str, context: ToolContext) -> TextMemory:
        await self._ensure_collection()          # ← thêm
        client = await self._ensure_client()
        memory_id = str(uuid.uuid4())
        timestamp = datetime.now().isoformat()
        embedding = self._create_embedding(content)

        payload = {
            "content": content,
            "timestamp": timestamp,
            "is_text_memory": True,
        }

        point = PointStruct(id=memory_id, vector=embedding, payload=payload)

        await client.upsert(collection_name=self.collection_name, points=[point])

        return TextMemory(memory_id=memory_id, content=content, timestamp=timestamp)
        
    async def search_text_memories(
        self,
        query: str,
        context: ToolContext,
        *,
        limit: int = 10,
        similarity_threshold: float = 0.7,
    ) -> List[TextMemorySearchResult]:
        
        await self._ensure_collection()          # ← thêm
        client = await self._ensure_client()

        embedding = self._create_embedding(query)
        query_filter = Filter(
            must=[
                FieldCondition(key="is_text_memory", match=MatchValue(value=True))
            ]
        )

        results = await client.query_points(
            collection_name=self.collection_name,
            query=embedding,
            limit=limit,
            query_filter=query_filter,
            score_threshold=similarity_threshold,
        )
      

        search_results = []
        for i, hit in enumerate(results.points):
            payload = hit.payload

            memory = TextMemory(
                memory_id=str(hit.id),
                content=payload.get("content", ""),
                timestamp=payload.get("timestamp"),
            )

            search_results.append(
                TextMemorySearchResult(
                    memory=memory, similarity_score=hit.score, rank=i + 1
                )
            )

        return search_results
    
    async def get_recent_text_memories(
        self, context: ToolContext, limit: int = 10
    ) -> List[TextMemory]:
        
        await self._ensure_collection()          # ← thêm
        client = await self._ensure_client()
        # Scroll through text memory points and sort by timestamp
        points, _ = await client.scroll(
            collection_name=self.collection_name,
            scroll_filter=Filter(
                must=[
                    FieldCondition(
                        key="is_text_memory", match=MatchValue(value=True)
                    )
                ]
            ),
            limit=1000,
            with_payload=True,
            with_vectors=False,
        )

        # Sort by timestamp
        sorted_points = sorted(
            points, key=lambda p: p.payload.get("timestamp", ""), reverse=True
        )

        memories = []
        for point in sorted_points[:limit]:
            payload = point.payload
            memory = TextMemory(
                memory_id=str(point.id),
                content=payload.get("content", ""),
                timestamp=payload.get("timestamp"),
            )
            memories.append(memory)

        return memories
    
    async def delete_text_memory(self, context: ToolContext, memory_id: str) -> bool:

        await self._ensure_collection()          # ← thêm
        client = await self._ensure_client()

        try:
            points = await client.retrieve(
                collection_name=self.collection_name,
                ids=[memory_id],
                with_payload=False,
                with_vectors=False,
            )

            if points and len(points) > 0:
                await client.delete(
                    collection_name=self.collection_name,
                    points_selector=PointIdsList(points=[memory_id]),
                )
                return True
            return False
        except Exception:
            return False

    async def clear_memories(
        self,
        context: ToolContext,
        tool_name: Optional[str] = None,
        before_date: Optional[str] = None,
    ) -> int:

        await self._ensure_collection()          # ← thêm
        client = await self._ensure_client()

        conditions = []
        if tool_name:
            conditions.append(
                FieldCondition(key="tool_name", match=MatchValue(value=tool_name))
            )
        if before_date:
            conditions.append(
                FieldCondition(key="timestamp", match=MatchValue(value=before_date))
            )

        if conditions or (tool_name is None and before_date is None):
            # Delete with filter or delete all
            query_filter = Filter(must=conditions) if conditions else None

            if query_filter:
                await client.delete(
                    collection_name=self.collection_name,
                    points_selector=query_filter,
                )
            else:
                # Delete all points
                await client.delete_collection(collection_name=self.collection_name)
                # Recreate empty collection
                await client.create_collection(
                    collection_name=self.collection_name,
                    vectors_config=VectorParams(
                        size=self.dimension, distance=Distance.COSINE
                    ),
                )

        return 0 
