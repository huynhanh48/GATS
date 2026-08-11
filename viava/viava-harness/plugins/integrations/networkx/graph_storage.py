from __future__ import annotations

from collections import deque
from pathlib import Path

import networkx as nx

from core.graph_storage.base import BaseGraphStorage
from core.graph_storage.models import GraphNode, GraphEdge, KnowledgeGraph


class NetworkXGraphStorage(BaseGraphStorage):
    """Triển khai BaseGraphStorage với NetworkX in-memory + GraphML persistence

    Mỗi instance = 1 nx.Graph() vô hướng.
    Có thể persist ra file GraphML hoặc chạy thuần in-memory.
    """

    def __init__(
        self, namespace: str, working_dir: str | None = None
    ) -> None:
        self._namespace = namespace
        self._graph = nx.Graph()

        if working_dir:
            self._graphml_path = Path(working_dir) / f"graph_{namespace}.graphml"
            self._graphml_path.parent.mkdir(parents=True, exist_ok=True)
        else:
            self._graphml_path = None

    # ------------------------------------------------------------------
    # Vòng đời (Lifecycle)
    # ------------------------------------------------------------------

    async def initialize(self) -> None:
        """Nạp graph từ file GraphML nếu tồn tại"""
        if self._graphml_path and self._graphml_path.exists():
            self._graph = nx.read_graphml(self._graphml_path)

    async def finalize(self) -> None:
        """Lưu graph + giải phóng"""
        if self._graphml_path:
            nx.write_graphml(self._graph, self._graphml_path)
        self._graph.clear()

    async def index_done_callback(self) -> None:
        """Persist graph ra file"""
        if self._graphml_path:
            nx.write_graphml(self._graph, self._graphml_path)

    async def drop_pending_index_ops(self) -> None:
        pass

    async def drop(self) -> dict[str, str]:
        """Xoá toàn bộ nút + cạnh + file"""
        try:
            self._graph.clear()
            if self._graphml_path and self._graphml_path.exists():
                self._graphml_path.unlink()
            return {"status": "success", "message": "data dropped"}
        except Exception as e:
            return {"status": "error", "message": str(e)}

    # ------------------------------------------------------------------
    # Kiểm tra tồn tại (Existence)
    # ------------------------------------------------------------------

    async def has_node(self, node_id: str) -> bool:
        return self._graph.has_node(node_id)

    async def has_edge(self, source: str, destination: str) -> bool:
        return self._graph.has_edge(source, destination)

    # ------------------------------------------------------------------
    # Bậc (Degree)
    # ------------------------------------------------------------------

    async def node_degree(self, node_id: str) -> int:
        return self._graph.degree(node_id)

    async def edge_degree(self, source: str, destination: str) -> int:
        return self._graph.degree(source) + self._graph.degree(destination)

    # ------------------------------------------------------------------
    # Truy vấn dữ liệu (Get)
    # ------------------------------------------------------------------

    async def get_node(self, node_id: str) -> GraphNode | None:
        if not self._graph.has_node(node_id):
            return None
        attrs = dict(self._graph.nodes[node_id])
        labels: list[str] = []
        if "label" in attrs:
            labels.append(attrs.pop("label"))
        return GraphNode(
            id=node_id, labels=labels,
            entity_type=attrs.pop("entity_type", "") or "",
            description=attrs.pop("description", "") or "",
            source_id=attrs.pop("source_id", "") or "",
            properties=attrs,
        )

    async def get_edge(self, source: str, destination: str) -> GraphEdge | None:
        if not self._graph.has_edge(source, destination):
            return None
        attrs = dict(self._graph.edges[source, destination])
        edge_type = attrs.pop("type", None) or attrs.pop("edge_type", "") or "fact"
        description = attrs.pop("description", "") or ""
        keywords = attrs.pop("keywords", "") or ""
        weight = attrs.pop("weight", None)
        source_id = attrs.pop("source_id", "") or ""
        return GraphEdge(
            id=f"{source}-{destination}",
            source=source, destination=destination,
            edge_type=edge_type, description=description, keywords=keywords,
            weight=float(weight) if weight is not None else 1.0,
            source_id=source_id, properties=attrs,
        )

    async def get_node_edges(
        self, node_id: str
    ) -> list[tuple[str, str]] | None:
        if not self._graph.has_node(node_id):
            return None
        return [
            (n1, n2)
            for n1, n2 in self._graph.edges(node_id)
        ]

    # ------------------------------------------------------------------
    # Ghi dữ liệu (Upsert)
    # ------------------------------------------------------------------

    async def upsert_node(self, node_id: str, node: GraphNode) -> None:
        all_attrs: dict[str, str | list[str] | float] = {**node.properties}
        if node.entity_type is not None:
            all_attrs["entity_type"] = node.entity_type
        if node.description is not None:
            all_attrs["description"] = node.description
        if node.source_id is not None:
            all_attrs["source_id"] = node.source_id
        self._graph.add_node(node_id, **all_attrs)

    async def upsert_edge(
        self, source: str, destination: str, edge: GraphEdge
    ) -> None:
        attrs: dict[str, str | float | None] = {**edge.properties}
        if edge.edge_type:
            attrs["type"] = edge.edge_type
        if edge.description is not None:
            attrs["description"] = edge.description
        if edge.keywords is not None:
            attrs["keywords"] = edge.keywords
        if edge.weight is not None:
            attrs["weight"] = edge.weight
        if edge.source_id is not None:
            attrs["source_id"] = edge.source_id
        self._graph.add_edge(source, destination, **attrs)

    # ------------------------------------------------------------------
    # Xoá (Delete)
    # ------------------------------------------------------------------

    async def delete_node(self, node_id: str) -> None:
        if self._graph.has_node(node_id):
            self._graph.remove_node(node_id)

    async def remove_nodes(self, nodes: list[str]) -> None:
        self._graph.remove_nodes_from(
            [n for n in nodes if self._graph.has_node(n)]
        )

    async def remove_edges(self, edges: list[tuple[str, str]]) -> None:
        self._graph.remove_edges_from(
            [(s, d) for s, d in edges if self._graph.has_edge(s, d)]
        )

    # ------------------------------------------------------------------
    # Truy vấn / Tìm kiếm (Query / Search)
    # ------------------------------------------------------------------

    async def get_all_labels(self) -> list[str]:
        """Lấy tất cả tên entity (node ID) trong graph — theo chuẩn LightRAG

        Returns:
            Danh sách tên entity đã sắp xếp alphabetically
        """
        return sorted(str(node) for node in self._graph.nodes())

    async def get_popular_labels(self, limit: int = 300) -> list[str]:
        """Lấy các entity name phổ biến nhất — sắp xếp theo degree giảm dần

        Args:
            limit: Số lượng tối đa entity trả về

        Returns:
            Danh sách entity name theo degree từ cao xuống thấp
        """
        degree_pairs = sorted(
            self._graph.degree(), key=lambda x: x[1], reverse=True
        )
        return [str(node) for node, _ in degree_pairs[:limit]]

    async def search_labels(self, query: str, limit: int = 50) -> list[str]:
        """Tìm kiếm entity theo tên (node ID) với fuzzy matching

        Args:
            query: Chuỗi tìm kiếm
            limit: Số lượng kết quả tối đa

        Returns:
            Danh sách entity name khớp, sắp xếp theo độ liên quan
        """
        seen: set[str] = set()
        matched: list[tuple[str, int]] = []
        q = query.lower()
        for node_id in self._graph.nodes():
            name = str(node_id)
            if name in seen:
                continue
            name_lower = name.lower()
            if q in name_lower:
                seen.add(name)
                if name_lower == q:
                    score = 3
                elif name_lower.startswith(q):
                    score = 2
                else:
                    score = 1
                matched.append((name, score))
        matched.sort(key=lambda x: x[1], reverse=True)
        return [name for name, _ in matched[:limit]]

    async def get_all_nodes(self) -> list[GraphNode]:
        result: list[GraphNode] = []
        for node_id, attrs in self._graph.nodes(data=True):
            attrs = dict(attrs)
            labels: list[str] = []
            if "label" in attrs:
                labels.append(attrs.pop("label"))
            result.append(GraphNode(
                id=node_id, labels=labels,
                entity_type=attrs.pop("entity_type", "") or "",
                description=attrs.pop("description", "") or "",
                source_id=attrs.pop("source_id", "") or "",
                properties=attrs,
            ))
        return result

    async def get_all_edges(self) -> list[GraphEdge]:
        result: list[GraphEdge] = []
        for u, v, attrs in self._graph.edges(data=True):
            attrs = dict(attrs)
            edge_type = attrs.pop("type", None) or attrs.pop("edge_type", "") or "fact"
            description = attrs.pop("description", "") or ""
            keywords = attrs.pop("keywords", "") or ""
            weight = attrs.pop("weight", None)
            source_id = attrs.pop("source_id", "") or ""
            result.append(GraphEdge(
                id=f"{u}-{v}", source=u, destination=v,
                edge_type=edge_type, description=description, keywords=keywords,
                weight=float(weight) if weight is not None else 1.0,
                source_id=source_id, properties=attrs,
            ))
        return result

    async def get_knowledge_graph(
        self, node_label: str, max_depth: int = 3, max_nodes: int = 1000
    ) -> KnowledgeGraph:
        """BFS từ nút có entity_type khớp node_label.

        "*" = tất cả nút, trả về toàn bộ graph (dừng khi hết nút).
        """
        start_nodes: list[str] = []
        if node_label == "*":
            start_nodes = list(self._graph.nodes)
        else:
            for node_id, attrs in self._graph.nodes(data=True):
                entity_type = attrs.get("entity_type", "")
                if entity_type and node_label.lower() in str(entity_type).lower():
                    start_nodes.append(node_id)

        if not start_nodes:
            return KnowledgeGraph()

        visited: set[str] = set()
        edge_ids: set[str] = set()
        queue: deque[tuple[str, int]] = deque()

        for nid in start_nodes:
            if len(visited) >= max_nodes:
                break
            visited.add(nid)
            queue.append((nid, 0))

        while queue and len(visited) < max_nodes:
            current, depth = queue.popleft()
            if depth >= max_depth:
                continue
            for neighbor in self._graph.neighbors(current):
                edge_str = f"{min(current, neighbor)}-{max(current, neighbor)}"
                edge_ids.add(edge_str)
                if neighbor not in visited and len(visited) < max_nodes:
                    visited.add(neighbor)
                    queue.append((neighbor, depth + 1))

        is_truncated = bool(queue) or len(self._graph.nodes) > len(visited)

        nodes: list[GraphNode] = []
        for nid in visited:
            attrs = dict(self._graph.nodes[nid])
            labels: list[str] = []
            if "label" in attrs:
                labels.append(attrs.pop("label"))
            nodes.append(GraphNode(
                id=nid, labels=labels,
                entity_type=attrs.pop("entity_type", "") or "",
                description=attrs.pop("description", "") or "",
                source_id=attrs.pop("source_id", "") or "",
                properties=attrs,
            ))

        edges: list[GraphEdge] = []
        for estr in edge_ids:
            parts = estr.split("-", 1)
            if len(parts) == 2 and self._graph.has_edge(parts[0], parts[1]):
                u, v = parts[0], parts[1]
                attrs = dict(self._graph.edges[u, v])
                edge_type = attrs.pop("type", None) or attrs.pop("edge_type", "") or "fact"
                description = attrs.pop("description", "") or ""
                keywords = attrs.pop("keywords", "") or ""
                weight = attrs.pop("weight", None)
                source_id = attrs.pop("source_id", "") or ""
                edges.append(GraphEdge(
                    id=estr, source=u, destination=v,
                    edge_type=edge_type, description=description, keywords=keywords,
                    weight=float(weight) if weight is not None else 1.0,
                    source_id=source_id, properties=attrs,
                ))

        return KnowledgeGraph(
            nodes=nodes, edges=edges, is_truncated=is_truncated,
        )

    async def personalized_pagerank(
        self,
        seed_nodes: dict[str, float],
        *,
        damping: float = 0.85,
        max_iter: int = 100,
        tol: float = 1e-6,
    ) -> dict[str, float]:
        if not seed_nodes:
            return {}

        personalization: dict[str, float] = {
            n: w for n, w in seed_nodes.items() if self._graph.has_node(n)
        }
        if not personalization:
            return {}

        return self._pagerank_power_iteration(
            personalization, damping, max_iter, tol
        )

    def _pagerank_power_iteration(
        self,
        personalization: dict[str, float],
        alpha: float,
        max_iter: int,
        tol: float,
    ) -> dict[str, float]:
        """Power iteration PPR — không cần scipy dependency"""
        nodelist = list(self._graph.nodes)
        n = len(nodelist)
        if n == 0:
            return {}

        p = {node: personalization.get(node, 0.0) for node in nodelist}
        p_sum = sum(p.values())
        if p_sum > 0:
            p = {k: v / p_sum for k, v in p.items()}
        else:
            p = {k: 1.0 / n for k in nodelist}

        x = {node: p[node] for node in nodelist}
        degrees = {node: max(self._graph.degree(node), 1) for node in nodelist}

        for _ in range(max_iter):
            xlast = x
            x = {node: (1.0 - alpha) * p[node] for node in nodelist}
            for node in nodelist:
                share = alpha * xlast[node] / degrees[node]
                for neighbor in self._graph.neighbors(node):
                    x[neighbor] += share

            err = sum(abs(x[node] - xlast[node]) for node in nodelist)
            if err < n * tol:
                break

        return {node: s for node, s in x.items() if s > 0}
