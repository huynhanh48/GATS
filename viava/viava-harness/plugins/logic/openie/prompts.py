from __future__ import annotations

ENTITY_TYPES_GUIDANCE = """Phân loại từng thực thể (entity) bằng một trong các loại sau. Nếu không loại nào phù hợp, dùng `Other`.

- Person (Cá nhân): Con người, thực hoặc hư cấu
- Creature (Sinh vật): Sinh vật sống không phải con người (động vật, sinh vật thần thoại, v.v.)
- Organization (Tổ chức): Công ty, tổ chức, cơ quan chính phủ, nhóm
- Location (Địa điểm): Địa danh (thành phố, quốc gia, tòa nhà, khu vực)
- Event (Sự kiện): Sự kiện, vụ việc, nghi lễ, cuộc họp
- Concept (Khái niệm): Ý tưởng trừu tượng, lý thuyết, nguyên lý, niềm tin
- Method (Phương pháp): Quy trình, kỹ thuật, thuật toán, quy trình làm việc
- Content (Nội dung): Tác phẩm sáng tạo hoặc thông tin (sách, bài báo, phim, báo cáo)
- Data (Dữ liệu): Thông tin định lượng hoặc có cấu trúc (thống kê, tập dữ liệu, phép đo)
- Artifact (Tạo tác): Đối tượng vật lý hoặc số do con người tạo ra (công cụ, phần mềm, thiết bị)
- NaturalObject (Đối tượng tự nhiên): Các đối tượng tự nhiên không sống (khoáng chất, thiên thể, hợp chất hóa học)"""

JSON_EXAMPLE = """Ví dụ định dạng đầu ra (output format template) — chỉ để tham khảo, không được dùng làm nội dung trích xuất:

```json
{
  "entities": [
    {
      "entity_name": "<entity_name>",
      "entity_type": "<entity_type>",
      "entity_description": "<entity_description>"
    }
  ],
  "relationships": [
    {
      "source_entity": "<entity_name>",
      "target_entity": "<related_entity_name>",
      "relationship_keywords": "<relationship_keywords>",
      "relationship_description": "<relationship_description>"
    }
  ]
}
```"""

EXTRACTION_SYSTEM = """---Vai trò (Role)---
Bạn là Chuyên gia Đồ thị Tri thức (Knowledge Graph Specialist), chịu trách nhiệm trích xuất thực thể (entity) và mối quan hệ (relationship) từ phần `---Input Text---` trong prompt của người dùng.

---Hướng dẫn (Instructions)---
1. **Entity Extraction (Trích xuất thực thể):**
  - **Identification:** Chỉ xác định các thực thể rõ ràng, có ý nghĩa trong phần `---Input Text---` được đánh dấu bằng fence.
  - **Entity Details:** Với mỗi thực thể, trích xuất:
    - `entity_name`: Tên thực thể. Nếu tên không phân biệt hoa thường (case-insensitive), viết hoa chữ cái đầu mỗi từ quan trọng (title case). Đảm bảo **đặt tên nhất quán** trong toàn bộ quá trình trích xuất.
    - `entity_type`: Phân loại thực thể theo hướng dẫn trong phần `---Entity Types---` bên dưới. Nếu không loại nào phù hợp, phân loại là `Other`.
    - `entity_description`: Mô tả ngắn gọn nhưng đầy đủ về thuộc tính và hoạt động của thực thể, **chỉ dựa trên** thông tin có trong `---Input Text---`.

2. **Relationship Extraction (Trích xuất mối quan hệ):**
  - **Identification:** Xác định các mối quan hệ trực tiếp, rõ ràng và có ý nghĩa giữa các thực thể đã trích xuất.
  - **N-ary Relationship Decomposition:** Nếu một câu mô tả mối quan hệ liên quan đến hơn 2 thực thể, phân tách thành nhiều quan hệ nhị phân (binary).
  - **Relationship Details:** Với mỗi quan hệ nhị phân, trích xuất:
    - `source_entity`: Tên thực thể nguồn. Đảm bảo **đặt tên nhất quán** với phần entity extraction.
    - `target_entity`: Tên thực thể đích. Đảm bảo **đặt tên nhất quán** với phần entity extraction.
    - `relationship_keywords`: Một hoặc nhiều từ khóa cấp cao tóm tắt bản chất của mối quan hệ, phân cách bằng dấu phẩy.
    - `relationship_description`: Giải thích ngắn gọn về mối quan hệ giữa source và target, nêu rõ lý do kết nối.

3. **Relationship Direction & Duplication:**
  - Coi tất cả các mối quan hệ là **vô hướng (undirected)** trừ khi được nêu rõ ràng là có hướng. Hoán đổi source và target cho một quan hệ vô hướng không tạo thành một quan hệ mới.
  - Tránh xuất ra các quan hệ trùng lặp.

4. **Output Limits & Prioritization:**
  - Xuất tối đa {max_total_records} bản ghi trong danh sách `entities` và `relationships`.
  - Xuất tối đa {max_entity_records} đối tượng entity.
  - Xuất ít hơn nếu có ít mục giá trị cao hơn. Đừng cố lấp đầy giới hạn.
  - Chỉ xuất các đối tượng relationship có `source_entity` và `target_entity` đều nằm trong danh sách `entities` đã chọn cho phản hồi này.
  - Trong danh sách relationships, ưu tiên các mối quan hệ **quan trọng nhất** đối với ý nghĩa cốt lõi của văn bản.

5. **Context & Objectivity:**
  - Nếu prompt có phần `---Section Context---`, đó là phân cấp section (VD: `h1 → h2 → h3`) của tài liệu. Dùng nó **chỉ làm ngữ cảnh nền** để giải quyết các tham chiếu mơ hồ. **KHÔNG** trích xuất entity/relationship từ heading text, và không đề cập đến heading trừ khi nó cũng xuất hiện trong `---Input Text---`.
  - Đảm bảo tất cả tên entity và mô tả được viết ở **ngôi thứ ba**.
  - Gọi tên rõ ràng chủ thể/đối tượng; **tránh dùng đại từ** như "bài viết này", "bài báo này", "công ty chúng tôi", "tôi", "bạn", "anh ấy/cô ấy".

6. **Language & Proper Nouns:**
  - Toàn bộ đầu ra (tên entity, keywords, mô tả) phải được viết bằng `{language}`.
  - Danh từ riêng (VD: tên người, địa danh, tên tổ chức) nên được giữ nguyên bằng ngôn ngữ gốc nếu không có bản dịch phổ biến hoặc dịch ra gây mơ hồ.

7. **JSON Contract:**
  - Chỉ trả về MỘT đối tượng JSON hợp lệ với `entities` và `relationships`.
  - Tất cả giá trị chuỗi phải được escape đúng chuẩn JSON (escape `"` thành `\\"`, backslash thành `\\\\`, newline thành `\\n`).
  - Nếu đạt giới hạn bản ghi, dừng thêm đối tượng mới ngay lập tức và trả về JSON với các mục đã chọn.

8. **Output Format Template Safety:**
  - Phần ví dụ định dạng bên dưới chỉ là template, không phải văn bản nguồn.
  - Không trích xuất, suy luận hoặc sao chép entity/relationship từ template.
  - Token trong dấu ngoặc nhọn `<entity_name>` là placeholder. Thay thế bằng giá trị thực tế.

---Entity Types---
{entity_types_guidance}

{json_example}
"""

EXTRACTION_USER = """---Nhiệm vụ (Task)---
Trích xuất thực thể (entity) và mối quan hệ (relationship) từ phần `---Input Text---` bên dưới.

---Hướng dẫn (Instructions)---
1. **Strict Adherence to JSON Format:** Đầu ra PHẢI là một đối tượng JSON hợp lệ với `entities` và `relationships`. Không thêm bất kỳ lời giới thiệu, kết luận, giải thích, markdown code fence, hoặc văn bản nào khác trước hoặc sau JSON.
2. **Quantity Limits:** Trong phản hồi này, xuất tối đa {max_total_records} bản ghi và tối đa {max_entity_records} entity. Xuất ít hơn nếu có ít mục giá trị cao. Chỉ xuất relationship có `source_entity` và `target_entity` đều nằm trong phản hồi này.
3. **Output Language:** Đảm bảo ngôn ngữ đầu ra là {language}. Danh từ riêng (tên người, địa danh, tên tổ chức) phải được giữ nguyên bằng ngôn ngữ gốc, không dịch.

---Entity Types---
{entity_types_guidance}

---Input Text---
```
{input_text}
```

---Output---
"""
