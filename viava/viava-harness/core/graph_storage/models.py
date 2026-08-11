from __future__ import annotations

from typing import Any, Literal

from pydantic import BaseModel, Field


class GraphNode(BaseModel):
    """Một nút (node) trong đồ thị tri thức (knowledge graph)

    Đại diện cho entity, passage chunk, hoặc bất kỳ đối tượng nào trong KG.
    """

    id: str
    """Định danh duy nhất của nút trong đồ thị"""

    entity_type: str
    """Loại thực thể (VD: 'Person', 'Organization', 'Concept')"""

    description: str
    """Mô tả của entity"""

    source_id: str
    """ID của các chunk nguồn, phân cách bởi <SEP>"""

    labels: list[str] = Field(default_factory=list)
    """Nhãn phân loại nút (VD: ["entity", "person"], ["passage"])"""

    properties: dict[str, Any] = Field(default_factory=dict)
    """Thuộc tính bổ sung (VD: {"degree": "5", "created_at": 1234567890})"""


class GraphEdge(BaseModel):
    """Một cạnh (edge/relation) giữa 2 nút trong đồ thị tri thức

    Tất cả các cạnh là vô hướng (undirected)không phân biệt hướng source ↔ destination.
    """

    id: str
    """Định danh duy nhất của cạnh"""

    source: str
    """ID của nút nguồn (source node)"""

    destination: str
    """ID của nút đích (destination node)"""

    edge_type: Literal["fact", "synonymy"]
    """Loại quan hệ: 'fact' = mối quan hệ thông thường, 'synonymy' = đồng nghĩa"""

    description: str
    """Mô tả mối quan hệ"""

    keywords: str
    """Từ khóa của mối quan hệ, phân cách bởi dấu phẩy"""

    source_id: str
    """ID của các chunk nguồn, phân cách bởi <SEP>"""

    weight: float = Field(default=1.0)
    """Trọng số của cạnh"""

    properties: dict[str, Any] = Field(default_factory=dict)
    """Thuộc tính bổ sung (VD: {"created_at": 1234567890})"""


class KnowledgeGraph(BaseModel):
    """Kết quả truy vấn subgraphtập nút và cạnh được kết nối

    Trả về từ get_knowledge_graph()BFS từ node_label với max_depth, max_nodes.
    """

    nodes: list[GraphNode] = Field(default_factory=list)
    """Danh sách nút trong subgraph"""

    edges: list[GraphEdge] = Field(default_factory=list)
    """Danh sách cạnh trong subgraph"""

    is_truncated: bool = False
    """True nếu kết quả bị cắt ngắn do vượt max_nodes"""
