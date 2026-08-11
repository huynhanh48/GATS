import re
import html

# Pattern cố định (biên dịch 1 lần ở module-level) để dò surrogate pairs và non-characters
_SURROGATE_PATTERN = re.compile(r"[\uD800-\uDFFF\uFFFE\uFFFF]")
# Pattern dò ký tự điều khiển (control characters), giữ lại \t \n \r
_CONTROL_CHAR_PATTERN_ALL = re.compile(r"[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]")

def sanitize_text_for_encoding(text: str, replacement_char: str = "") -> str:
    """Vệ sinh text để đảm bảo encode UTF-8 an toàn.

    Xử lý:
    - Surrogate characters (nguyên nhân chính gây lỗi encode)
    - Non-characters (U+FFFE, U+FFFF)
    - Ký tự điều khiển (trừ tab, newline, carriage return)
    - HTML entities → giải mã trước

    Args:
        text: Text đầu vào cần vệ sinh
        replacement_char: Ký tự thay thế (mặc định xoá hẳn)

    Returns:
        Text đã được làm sạch, an toàn để encode UTF-8
    """
    if not text:
        return text

    text = text.strip()
    if not text:
        return text

    # Giải mã HTML entities trước, đề phòng entity biến thành surrogate/control char
    text = html.unescape(text)

    # Xoá surrogate và non-characters bằng regex (nhanh hơn vòng lặp thủ công)
    text = _SURROGATE_PATTERN.sub(replacement_char, text)

    # Xoá ký tự điều khiển (giữ lại tab, newline, carriage return)
    text = _CONTROL_CHAR_PATTERN_ALL.sub(replacement_char, text)

    return text.strip()