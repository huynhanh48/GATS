import datetime
import hashlib
import uuid

def compute_mdhash_id(content: str, prefix: str = "") -> str:
        """Tạo hash ID cho chunk"""
        content_hash = hashlib.md5(content.encode('utf-8')).hexdigest()
        return f"{prefix}{content_hash}"

def generate_track_id(prefix: str = "upload") -> str:
    """Generate a unique tracking ID with timestamp and UUID

    Args:
        prefix: Prefix for the track ID (e.g., 'upload', 'insert')

    Returns:
        str: Unique tracking ID in format: {prefix}_{timestamp}_{uuid}
    """
    timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    unique_id = str(uuid.uuid4())[:8]  # Use first 8 characters of UUID
    return f"{prefix}_{timestamp}_{unique_id}"

def generate_conversation_id(prefix: str = "conv") -> str:
    """Generate a unique conversation ID with timestamp and UUID

    Args:
        prefix: Prefix for the track ID (e.g., 'upload', 'insert')

    Returns:
        str: Unique conversation ID in format: {prefix}_{timestamp}_{uuid}
    """
    timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    unique_id = str(uuid.uuid4())[:8]  # Use first 8 characters of UUID
    return f"{prefix}_{timestamp}_{unique_id}"

def count_tokens(text: str) -> int:
        """Đếm số token bằng tiktoken (gpt-4o)."""
        import tiktoken
        enc = tiktoken.encoding_for_model("gpt-4o")
        return len(enc.encode(text, disallowed_special=()))