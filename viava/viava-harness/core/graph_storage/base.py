from __future__ import annotations

from abc import ABC, abstractmethod

from .models import GraphNode, GraphEdge, KnowledgeGraph


class BaseGraphStorage(ABC):
    """Kho lưu trữ đồ thị tri thức (knowledge graph storage) — interface trừu tượng

    Mỗi instance quản lý 1 namespace (VD: "rag_graph", "agent_kg").
    Tất cả các thao tác trên cạnh (edge) là vô hướng (undirected) —
    source ↔ destination là hoán đổi được, không phân biệt hướng.

    Dùng được cho nhiều use-case:
      - RAG: lưu entity, relation, passage links
      - Knowledge graph: truy vấn subgraph, search entity labels, PPR
      - Agent memory: lưu semantic relationships giữa các memories
      - Graph analytics: tính degree, popular labels, personalized pagerank

    Kiến trúc:
      - Mỗi instance = 1 namespace (1 file/DB/collection)
      - Dữ liệu node/edge lưu dạng dict linh hoạt — backend có thể thêm field riêng
      - Batch methods có default implementation serial — backend override để tối ưu
      - Write-behind pattern: thay đổi chưa persist ngay, gọi index_done_callback() để flush
    """

    # ------------------------------------------------------------------
    # Vòng đời (Lifecycle)
    # ------------------------------------------------------------------

    async def initialize(self) -> None:
        """Khởi tạo storage — tạo file/DB/collection, kết nối backend, v.v.

        Triển khai mặc định là no-op.
        Backend concrete override method này để setup resources.
        """
        pass

    async def finalize(self) -> None:
        """Dọn dẹp storage — flush buffer cuối cùng, đóng kết nối, v.v.

        Triển khai mặc định là no-op.
        """
        pass

    @abstractmethod
    async def index_done_callback(self) -> None:
        """Commit toàn bộ pending writes (buffer) xuống storage backend

        Gọi sau khi hoàn tất một batch indexing để flush buffer.
        Backend dùng write-behind pattern cần override method này.
        Backend ghi trực tiếp (immediate write) có thể để no-op.
        """
        pass

    async def drop_pending_index_ops(self) -> None:
        """Hủy toàn bộ pending writes đang nằm trong buffer

        Pipeline gọi khi batch indexing gặp lỗi nội bộ:
          - Mọi bản ghi còn trong buffer thuộc về document đang bị đánh FAILED
          - Discard buffer là an toàn — tránh lưu dữ liệu lỗi/hỏng xuống storage
          - Document sẽ được xử lý lại từ đầu ở lần chạy tiếp theo

        Mặc định no-op. Backend dùng buffer override method này.
        """
        return None

    @abstractmethod
    async def drop(self) -> dict[str, str]:
        """Xoá toàn bộ dữ liệu và reset storage về trạng thái ban đầu

        Yêu cầu:
          1. Xoá hết data trong memory và/hoặc external storage
          2. Xoá các file liên quan (nếu có)
          3. Reset storage về trạng thái khởi tạo
          4. Dọn dẹp tài nguyên (resources)
          5. Thông báo tới process khác nếu cần
          6. Phải persist thay đổi xuống disk ngay lập tức

        Returns:
            {"status": "success", "message": "data dropped"} — thành công
            {"status": "error", "message": "<lỗi chi tiết>"} — thất bại
            {"status": "error", "message": "unsupported"} — không hỗ trợ
        """
        pass

    # ------------------------------------------------------------------
    # Kiểm tra tồn tại (Existence)
    # ------------------------------------------------------------------

    @abstractmethod
    async def has_node(self, node_id: str) -> bool:
        """Kiểm tra nút có tồn tại trong đồ thị

        Args:
            node_id: ID của nút cần kiểm tra

        Returns:
            True nếu nút tồn tại, False nếu không
        """
        pass

    @abstractmethod
    async def has_edge(self, source: str, destination: str) -> bool:
        """Kiểm tra cạnh có tồn tại giữa 2 nút

        Args:
            source: ID của nút nguồn
            destination: ID của nút đích

        Returns:
            True nếu cạnh tồn tại, False nếu không
        """
        pass

    # ------------------------------------------------------------------
    # Bậc (Degree) — số lượng cạnh nối với nút
    # ------------------------------------------------------------------

    @abstractmethod
    async def node_degree(self, node_id: str) -> int:
        """Lấy bậc (degree) của một nút — số cạnh nối đến nó

        Args:
            node_id: ID của nút cần tính bậc

        Returns:
            Số cạnh được kết nối với nút
        """
        pass

    @abstractmethod
    async def edge_degree(self, source: str, destination: str) -> int:
        """Lấy tổng bậc của một cạnh — node_degree(source) + node_degree(destination)

        Args:
            source: ID của nút nguồn
            destination: ID của nút đích

        Returns:
            Tổng bậc của nút nguồn và nút đích
        """
        pass

    # ------------------------------------------------------------------
    # Truy vấn dữ liệu (Get)
    # ------------------------------------------------------------------

    @abstractmethod
    async def get_node(self, node_id: str) -> GraphNode | None:
        """Lấy dữ liệu nút theo ID

        Args:
            node_id: ID của nút cần lấy

        Returns:
            GraphNode nếu tìm thấy, None nếu không tồn tại
        """
        pass

    @abstractmethod
    async def get_edge(self, source: str, destination: str) -> GraphEdge | None:
        """Lấy dữ liệu cạnh giữa 2 nút

        Args:
            source: ID của nút nguồn
            destination: ID của nút đích

        Returns:
            GraphEdge nếu tìm thấy, None nếu không tồn tại
        """
        pass

    @abstractmethod
    async def get_node_edges(self, node_id: str) -> list[tuple[str, str]] | None:
        """Lấy tất cả cạnh kết nối với một nút

        Args:
            node_id: ID của nút cần lấy danh sách cạnh

        Returns:
            Danh sách tuple (source_id, destination_id) đại diện cho các cạnh,
            hoặc None nếu nút không tồn tại
        """
        pass

    # ------------------------------------------------------------------
    # Ghi dữ liệu (Upsert)
    # ------------------------------------------------------------------

    @abstractmethod
    async def upsert_node(self, node_id: str, node: GraphNode) -> None:
        """Chèn mới hoặc cập nhật một nút trong đồ thị

        Lưu ý với storage in-memory:
          1. Thay đổi chưa được persist ngay. Gọi index_done_callback() để flush.
          2. Chỉ một process cập nhật storage tại một thời điểm trước index_done_callback.
             Dùng KG-storage-log để tránh data corruption.

        Args:
            node_id: ID của nút cần chèn hoặc cập nhật
            node: GraphNode chứa labels và properties của nút
        """
        pass

    @abstractmethod
    async def upsert_edge(
        self, source: str, destination: str, edge: GraphEdge
    ) -> None:
        """Chèn mới hoặc cập nhật một cạnh trong đồ thị

        Cạnh là vô hướng — source và destination có thể hoán đổi.

        Lưu ý: tương tự upsert_node, cần index_done_callback() để persist.

        Args:
            source: ID của nút nguồn
            destination: ID của nút đích
            edge: GraphEdge chứa edge_type và properties của cạnh
        """
        pass

    # ------------------------------------------------------------------
    # Xoá (Delete)
    # ------------------------------------------------------------------

    @abstractmethod
    async def delete_node(self, node_id: str) -> None:
        """Xoá một nút khỏi đồ thị

        Lưu ý: tương tự upsert, cần index_done_callback() để persist.

        Args:
            node_id: ID của nút cần xoá
        """
        pass

    @abstractmethod
    async def remove_nodes(self, nodes: list[str]) -> None:
        """Xoá nhiều nút khỏi đồ thị

        Lưu ý: tương tự upsert, cần index_done_callback() để persist.

        Args:
            nodes: Danh sách ID của các nút cần xoá
        """
        pass

    @abstractmethod
    async def remove_edges(self, edges: list[tuple[str, str]]) -> None:
        """Xoá nhiều cạnh khỏi đồ thị

        Lưu ý: tương tự upsert, cần index_done_callback() để persist.

        Args:
            edges: Danh sách tuple (source, destination) của các cạnh cần xoá
        """
        pass

    # ------------------------------------------------------------------
    # Batch operations — mặc định gọi serial, backend override để tối ưu
    # ------------------------------------------------------------------

    async def get_nodes_batch(self, node_ids: list[str]) -> dict[str, GraphNode]:
        """Lấy nhiều nút cùng lúc

        Mặc định gọi get_node() tuần tự. Backend override để tối ưu batch query.

        Args:
            node_ids: Danh sách ID các nút cần lấy

        Returns:
            Dict ánh xạ node_id -> GraphNode (chỉ những nút tìm thấy)
        """
        result: dict[str, GraphNode] = {}
        for node_id in node_ids:
            node = await self.get_node(node_id)
            if node is not None:
                result[node_id] = node
        return result

    async def node_degrees_batch(self, node_ids: list[str]) -> dict[str, int]:
        """Lấy bậc của nhiều nút cùng lúc

        Mặc định gọi node_degree() tuần tự. Backend override để tối ưu batch query.

        Args:
            node_ids: Danh sách ID các nút cần tính bậc

        Returns:
            Dict ánh xạ node_id -> degree
        """
        result: dict[str, int] = {}
        for node_id in node_ids:
            result[node_id] = await self.node_degree(node_id)
        return result

    async def edge_degrees_batch(
        self, edge_pairs: list[tuple[str, str]]
    ) -> dict[tuple[str, str], int]:
        """Lấy tổng bậc của nhiều cạnh cùng lúc

        Mặc định gọi edge_degree() tuần tự. Backend override để tối ưu batch query.

        Args:
            edge_pairs: Danh sách tuple (source, destination)

        Returns:
            Dict ánh xạ (source, destination) -> tổng bậc
        """
        result: dict[tuple[str, str], int] = {}
        for src, dst in edge_pairs:
            result[(src, dst)] = await self.edge_degree(src, dst)
        return result

    async def get_edges_batch(
        self, pairs: list[dict[str, str]]
    ) -> dict[tuple[str, str], GraphEdge]:
        """Lấy nhiều cạnh cùng lúc

        Mặc định gọi get_edge() tuần tự. Backend override để tối ưu batch query.

        Args:
            pairs: Danh sách dict {"src": source_id, "dst": destination_id}

        Returns:
            Dict ánh xạ (source, destination) -> GraphEdge (chỉ những cạnh tìm thấy)
        """
        result: dict[tuple[str, str], GraphEdge] = {}
        for pair in pairs:
            src = pair["src"]
            dst = pair["tgt"]
            edge = await self.get_edge(src, dst)
            if edge is not None:
                result[(src, dst)] = edge
        return result

    async def get_nodes_edges_batch(
        self, node_ids: list[str]
    ) -> dict[str, list[tuple[str, str]]]:
        """Lấy danh sách cạnh của nhiều nút cùng lúc

        Mặc định gọi get_node_edges() tuần tự. Backend override để tối ưu batch query.

        Args:
            node_ids: Danh sách ID các nút cần lấy cạnh

        Returns:
            Dict ánh xạ node_id -> list tuple (source, destination).
            Nút không tồn tại sẽ có danh sách rỗng.
        """
        result: dict[str, list[tuple[str, str]]] = {}
        for node_id in node_ids:
            edges = await self.get_node_edges(node_id)
            result[node_id] = edges if edges is not None else []
        return result

    async def upsert_nodes_batch(
        self, nodes: list[tuple[str, GraphNode]]
    ) -> None:
        """Chèn/cập nhật nhiều nút cùng lúc

        Mặc định gọi upsert_node() tuần tự. Backend override để tối ưu batch insert.

        Args:
            nodes: Danh sách tuple (node_id, GraphNode)
        """
        for node_id, node in nodes:
            await self.upsert_node(node_id, node=node)

    async def upsert_edges_batch(
        self, edges: list[tuple[str, str, GraphEdge]]
    ) -> None:
        """Chèn/cập nhật nhiều cạnh cùng lúc

        Mặc định gọi upsert_edge() tuần tự. Backend override để tối ưu batch insert.

        Args:
            edges: Danh sách tuple (source, destination, GraphEdge)
        """
        for source, destination, edge in edges:
            await self.upsert_edge(source, destination, edge=edge)

    async def has_nodes_batch(self, node_ids: list[str]) -> set[str]:
        """Kiểm tra sự tồn tại của nhiều nút cùng lúc

        Mặc định gọi has_node() tuần tự. Backend override để tối ưu batch check.

        Args:
            node_ids: Danh sách ID các nút cần kiểm tra

        Returns:
            Set các node_id tồn tại trong đồ thị
        """
        existing: set[str] = set()
        for node_id in node_ids:
            if await self.has_node(node_id):
                existing.add(node_id)
        return existing

    # ------------------------------------------------------------------
    # Truy vấn / Tìm kiếm (Query / Search)
    # ------------------------------------------------------------------

    @abstractmethod
    async def get_all_labels(self) -> list[str]:
        """Lấy tất cả nhãn (label) của các nút trong đồ thị

        Không dùng cho đồ thị lớn — dùng get_popular_labels() hoặc search_labels() thay thế.

        Returns:
            Danh sách tất cả label, sắp xếp theo bảng chữ cái
        """
        pass

    @abstractmethod
    async def get_popular_labels(self, limit: int = 300) -> list[str]:
        """Lấy các nhãn phổ biến nhất — sắp xếp theo bậc (degree) giảm dần

        Args:
            limit: Số lượng label tối đa trả về

        Returns:
            Danh sách label sắp xếp theo degree từ cao xuống thấp
        """
        pass

    @abstractmethod
    async def search_labels(self, query: str, limit: int = 50) -> list[str]:
        """Tìm kiếm nhãn (label) với fuzzy matching

        Args:
            query: Chuỗi tìm kiếm
            limit: Số lượng kết quả tối đa

        Returns:
            Danh sách label khớp, sắp xếp theo độ liên quan (relevance)
        """
        pass

    @abstractmethod
    async def get_all_nodes(self) -> list[GraphNode]:
        """Lấy tất cả nút trong đồ thị

        Trả về toàn bộ danh sách nút — cân nhắc dùng limit nếu đồ thị lớn.

        Returns:
            Danh sách tất cả GraphNode trong đồ thị
        """
        pass

    @abstractmethod
    async def get_all_edges(self) -> list[GraphEdge]:
        """Lấy tất cả cạnh trong đồ thị

        Trả về toàn bộ danh sách cạnh. Với một số backend lưu cạnh 2 chiều,
        caller phải tự deduplicate.

        Returns:
            Danh sách tất cả GraphEdge trong đồ thị
        """
        pass

    @abstractmethod
    async def get_knowledge_graph(
        self, node_label: str, max_depth: int = 3, max_nodes: int = 1000
    ) -> KnowledgeGraph:
        """Truy vấn subgraph — BFS từ nút có label khớp node_label

        Args:
            node_label: Label của nút bắt đầu. "*" = tất cả các nút.
            max_depth: Độ sâu tối đa của subgraph (mặc định 3)
            max_nodes: Số nút tối đa trả về (mặc định 1000). Dùng BFS nếu có thể.

        Returns:
            KnowledgeGraph chứa nodes và edges trong subgraph.
            is_truncated = True nếu bị cắt do vượt max_nodes.
        """
        pass

    @abstractmethod
    async def personalized_pagerank(
        self,
        seed_nodes: dict[str, float],
        *,
        damping: float = 0.85,
        max_iter: int = 100,
        tol: float = 1e-6,
    ) -> dict[str, float]:
        """Tính Personalized PageRank (PPR) trên đồ thị

        Bắt đầu từ tập seed_nodes với trọng số cho trước, tính PPR score
        cho tất cả các nút trong đồ thị.

        Công thức cơ bản:
            score[v] = (1 - damping) * personalization[v]
                        + damping * sum(score[u] / out_degree[u]) với u là neighbor của v

        Args:
            seed_nodes: Dict ánh xạ node_id -> trọng số khởi tạo
            damping: Hệ số damping (0.85 mặc định) — xác suất tiếp tục random walk
            max_iter: Số vòng lặp tối đa
            tol: Ngưỡng hội tụ — dừng khi delta < tol

        Returns:
            Dict ánh xạ node_id -> PPR score (chỉ các nút có score > 0)
        """
        pass
