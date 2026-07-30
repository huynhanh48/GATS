TRUNCATION_MARKER = """\
[...Nội dung file `{source}` bị cắt bớt do giới hạn độ dài. \
Sử dụng công cụ read_file để đọc toàn bộ nội dung nếu cần...]\
"""


def compute_dynamic_cap(
    context_window_tokens: int,
    chars_per_token: float = 4.0,
) -> int:
    """
    Hàm tính giới hạn ký tự tối đa (max_chars) cho context files (MEMORY.md, AGENTS.md) dựa trên context_window của model.
    Công thức: 6% × context_window_tokens × 4 (chars/token)
    Ví dụ:
    - Model 200K tokens → cap 48K chars
    - Model 128K tokens → cap 30.7K chars
    - Model 1M tokens → cap 240K chars (dưới ceiling 500K)
    Mục đích: file nhỏ đi qua, file lớn bị truncate (head/tail) với marker "dùng read_file để đọc tiếp". Dynamic cap scale theo model để không waste token với model nhỏ nhưng cũng không truncate quá mức với model lớn.
        
    """
    raw = int(context_window_tokens * 0.06 * chars_per_token)
    return max(20_000, min(500_000, raw))


def truncate_content(
    content: str,
    max_chars: int,
    head_ratio: 0.7,
    source_name: str = ""
) -> str:
    if len(content) <= max_chars:
        return content
    
    marker = TRUNCATION_MARKER.format(source=source_name)
    head_size = int(max_chars * head_ratio)
    tail_size = max_chars - head_size - len(marker)

    if tail_size < 10:
        head_size = max_chars - len(marker) - 10
        tail_size = 10

    head = content[:head_size]
    tail = content[-tail_size:]

    return f"{head}\n\n{marker}\n\n{tail}"