from __future__ import annotations

from pydantic import BaseModel, ConfigDict, Field


class ExtractedEntity(BaseModel):
    """Một thực thể (entity) được trích xuất từ văn bản bởi LLM

    Mỗi entity đại diện cho một đối tượng có thật hoặc trừu tượng trong văn bản,
    gồm tên, loại và mô tả ngắn gọn. Dùng trong knowledge graph construction
    — mỗi entity sẽ trở thành một nút (node) trong đồ thị.

    Nhận JSON từ LLM với field name ngắn gọn (name/type/description) và
    chuẩn hóa thành tên rõ ràng (entity_name/entity_type/entity_description).
    """

    model_config = ConfigDict(extra="forbid")

    entity_name: str = Field(
        description=(
            "Tên của thực thể. Nếu tên không phân biệt hoa thường (case-insensitive), "
            "viết hoa chữ cái đầu mỗi từ quan trọng (title case). "
            "VD: 'Albert Einstein', 'OpenAI', 'World War II'. "
            "Phải đảm bảo đặt tên nhất quán trong toàn bộ quá trình trích xuất — "
            "cùng một thực thể xuất hiện nhiều lần phải có cùng entity_name."
        ),
    )

    entity_type: str = Field(
        description=(
            "Loại/phân loại của thực thể, chọn từ danh sách entity types "
            "được định nghĩa trong prompt (Person, Organization, Location, Event, "
            "Concept, Method, Content, Data, Artifact, NaturalObject, Creature, Other). "
            "VD: 'Person', 'Organization', 'Location'. "
            "Nếu không loại nào phù hợp, dùng 'Other'."
        ),
    )

    entity_description: str = Field(
        description=(
            "Mô tả ngắn gọn nhưng đầy đủ về thuộc tính và hoạt động của thực thể, "
            "chỉ dựa trên thông tin có trong văn bản đầu vào (không suy diễn thêm). "
            "VD: 'Nhà vật lý người Đức, phát triển thuyết tương đối năm 1905'. "
            "Viết ở ngôi thứ ba, tránh dùng đại từ (ông ấy, bà ấy, họ)."
        ),
    )


class ExtractedRelationship(BaseModel):
    """Một mối quan hệ (relationship) giữa 2 thực thể được trích xuất từ văn bản

    Biểu diễn mối liên kết ngữ nghĩa giữa source_entity và target_entity.
    Mối quan hệ là vô hướng (undirected) trừ khi được nêu rõ ràng là có hướng —
    hoán đổi source và target không tạo thành một relationship mới.

    Dùng trong knowledge graph construction — mỗi relationship sẽ trở thành
    một cạnh (edge) nối 2 nút entity trong đồ thị.

    Nhận JSON từ LLM với field name ngắn gọn (source/target/keywords/description)
    và chuẩn hóa thành tên rõ ràng.
    """

    model_config = ConfigDict(extra="forbid")

    source_entity: str = Field(
        description=(
            "Tên của thực thể nguồn (source entity) trong mối quan hệ. "
            "Phải khớp chính xác với entity_name của một entity đã được trích xuất. "
            "VD: 'Albert Einstein'. "
            "Đảm bảo đặt tên nhất quán với phần entity extraction."
        ),
    )

    target_entity: str = Field(
        description=(
            "Tên của thực thể đích (target entity) trong mối quan hệ. "
            "Phải khớp chính xác với entity_name của một entity đã được trích xuất. "
            "VD: 'Theory of Relativity'. "
            "Đảm bảo đặt tên nhất quán với phần entity extraction."
        ),
    )

    relationship_keywords: str = Field(
        description=(
            "Một hoặc nhiều từ khóa cấp cao (high-level keywords) tóm tắt bản chất, "
            "khái niệm hoặc chủ đề của mối quan hệ. "
            "Nhiều từ khóa phân cách bằng dấu phẩy (,). "
            "VD: 'developed, proposed, published'. "
            "Từ khóa nên ngắn gọn, là động từ/danh từ mô tả hành động kết nối."
        ),
    )

    relationship_description: str = Field(
        description=(
            "Giải thích ngắn gọn về bản chất của mối quan hệ giữa source và target, "
            "nêu rõ lý do và ngữ cảnh kết nối. "
            "VD: 'Einstein developed the theory of relativity, "
            "fundamentally changing the understanding of space and time'. "
            "Viết ở ngôi thứ ba, tránh dùng đại từ, chỉ dựa trên thông tin trong văn bản."
        ),
    )


class ExtractionResult(BaseModel):
    """Kết quả trích xuất entity + relationship từ một đoạn văn bản

    Định dạng đầu ra có cấu trúc cho entity/relationship extraction.
    Dùng trực tiếp làm output_parser cho LLM — field alias trong ExtractedEntity
    và ExtractedRelationship khớp với JSON format của prompt
    (entities[{name, type, description}], relationships[{source, target, keywords, description}]).

    Luồng sử dụng:
      1. Prompt yêu cầu LLM xuất JSON với entities[] và relationships[]
      2. LLM trả về JSON dùng field name gốc (name, type, source, target, ...)
      3. Pydantic alias tự động map sang entity_name, entity_type, source_entity, ...
      4. Consumer code dùng field name đầy đủ, rõ ràng để truy cập dữ liệu
    """

    model_config = ConfigDict(extra="forbid")

    entities: list[ExtractedEntity] = Field(
        default_factory=list,
        description=(
            "Danh sách các thực thể được trích xuất từ văn bản đầu vào. "
            "Mỗi entity sẽ trở thành một nút (node) trong knowledge graph. "
            "Danh sách rỗng nếu không tìm thấy entity nào có ý nghĩa."
        ),
    )

    relationships: list[ExtractedRelationship] = Field(
        default_factory=list,
        description=(
            "Danh sách các mối quan hệ giữa các thực thể được trích xuất. "
            "Mỗi relationship sẽ trở thành một cạnh (edge) nối 2 nút entity. "
            "Chỉ chứa các relationship có source và target đều nằm trong danh sách entities. "
            "Danh sách rỗng nếu không tìm thấy relationship nào."
        ),
    )
