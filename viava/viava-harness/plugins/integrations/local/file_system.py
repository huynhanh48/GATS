import asyncio
from typing import List, Optional
from pathlib import Path
from capabilities.file_system import FileSystem, FileSearchMatch, CommandResult
from core.file_extractor import FileExtractorBase
from core.media import MediaProcessorBase
from core.ocr import OCRBase
from core.speech_to_text import SpeechToTextBase
from core.tool import ToolContext
from utils.platform import resolve_shell_command
from utils.paths import get_data_dir

_READ_REMAINING_OUTPUT_TIMEOUT_SECONDS = 2.0
MAX_OUTPUT_CHARS = 12_000
MAX_SEARCH_FILE_BYTES = 1_000_000
FILENAME_MATCH_SNIPPET = "[filename match]"


_TEXT_FORMATS: frozenset[str] = frozenset({
    ".txt", ".md", ".json", ".py", ".yaml", ".yml", ".csv", ".html", ".xml",
    ".css", ".js", ".ts", ".sh", ".bat", ".ps1", ".toml", ".ini", ".cfg",
    ".log", ".env", ".java", ".c", ".cpp", ".h", ".rs", ".go", ".rb",
    ".php", ".sql", ".r", ".m", ".swift", ".kt", ".scala", ".tex",
})

_DOC_FORMATS: frozenset[str] = frozenset({".docx", ".pdf", ".xlsx", ".pptx", ".epub"})
_IMAGE_FORMATS: frozenset[str] = frozenset({".jpg", ".jpeg", ".png", ".bmp", ".tiff", ".gif", ".webp"})
_AUDIO_FORMATS: frozenset[str] = frozenset({".mp3", ".wav", ".m4a", ".ogg", ".flac", ".wma"})
_VIDEO_FORMATS: frozenset[str] = frozenset({".mp4", ".mov", ".avi", ".mkv", ".webm", ".flv", ".wmv"})


def _make_snippet(text: str, query: str, context_window: int = 60) -> Optional[str]:
    lowered_text = text.lower()
    index = lowered_text.find(query.lower())
    if index == -1:
        return None
    start = max(0, index - context_window)
    end = min(len(text), index + len(query) + context_window)
    snippet = text[start:end].replace("\n", " ").strip()
    if start > 0:
        snippet = "..." + snippet
    if end < len(text):
        snippet = snippet + "..."
    return snippet


class LocalFileSystem(FileSystem):

    def __init__(
        self,
        working_directory: str | None = None,
        file_extractor: FileExtractorBase | None = None,
        ocr: OCRBase | None = None,
        speech: SpeechToTextBase | None = None,
        media: MediaProcessorBase | None = None,
    ):
        self.working_directory = Path(working_directory) if working_directory else get_data_dir()
        self._file_extractor = file_extractor
        self._ocr = ocr
        self._speech = speech
        self._media = media

    def _get_user_directory(self, context: ToolContext) -> Path:
        user_dir = self.working_directory / "user" / context.user.username
        user_dir.mkdir(parents=True, exist_ok=True)
        return user_dir
    def _resolve_path(self, context: ToolContext, relative_path: str) -> Path:
        """
        Giải quyết đường dẫn tệp dựa trên thư mục người dùng.

        Args:
            context: Ngữ cảnh công cụ chứa thông tin người dùng.
            relative_path: Đường dẫn tương đối của tệp.

        Returns:
            Đường dẫn tuyệt đối đến tệp.
        """
        user_dir = self._get_user_directory(context)
        resolved_path = user_dir / relative_path

        # đảm bảo rằng resolved_path nằm trong user_dir để tránh truy cập trái phép
        try:
            resolved_path.resolve().relative_to(user_dir.resolve())
        except ValueError:
            raise ValueError(f"Đường dẫn tệp {relative_path} không hợp lệ hoặc nằm ngoài thư mục người dùng.")
        return resolved_path
    
    async def list_files(self, directory_path: str, context: ToolContext) -> list[str]:
        """
        Liệt kê các tệp trong thư mục người dùng.

        Args:
            directory_path: Đường dẫn tương đối của thư mục.
            context: Ngữ cảnh công cụ chứa thông tin người dùng.

        Returns:
            Danh sách tên tệp trong thư mục.
        """
        resolved_dir = self._resolve_path(context, directory_path)
        
        if not resolved_dir.exists():
            raise ValueError(f"Thư mục {directory_path} không tồn tại.")
        
        if not resolved_dir.is_dir():
            raise ValueError(f"{directory_path} không phải là một thư mục hợp lệ.")
        

        files = [f.name for f in resolved_dir.iterdir() if f.is_file()]
        return sorted(files)
    
    async def read_file(self, file_path: str, context: ToolContext) -> str:
        """
        Đọc nội dung của tệp trong thư mục người dùng.

        Args:
            file_path: Đường dẫn tương đối của tệp.
            context: Ngữ cảnh công cụ chứa thông tin người dùng.

        Returns:
            Nội dung của tệp dưới dạng chuỗi.
        """
        resolved_file = self._resolve_path(context, file_path)

        if not resolved_file.exists():
            raise ValueError(f"Tệp {file_path} không tồn tại.")

        if not resolved_file.is_file():
            raise ValueError(f"{file_path} không phải là một tệp hợp lệ.")

        suffix = resolved_file.suffix.lower()

        if suffix in _TEXT_FORMATS:
            return self._read_text(resolved_file)

        if suffix in _DOC_FORMATS:
            if self._file_extractor is None:
                raise ValueError(f"Không hỗ trợ {suffix} (thiếu file_extractor)")
            results = await self._file_extractor.extract(str(resolved_file))
            return results[0].content if results else ""

        if suffix in _IMAGE_FORMATS:
            if self._ocr is None:
                raise ValueError(f"Không hỗ trợ {suffix} (thiếu OCR)")
            result = await self._ocr.extract(str(resolved_file))
            return result.text

        if suffix in _AUDIO_FORMATS:
            if self._speech is None:
                raise ValueError(f"Không hỗ trợ {suffix} (thiếu speech)")
            result = await self._speech.transcribe(str(resolved_file))
            return result.text

        if suffix in _VIDEO_FORMATS:
            if self._media is None:
                raise ValueError(f"Không hỗ trợ {suffix} (thiếu media)")
            if self._speech is None:
                raise ValueError(f"Không hỗ trợ {suffix} (thiếu speech)")
            audio = await self._media.extract_audio(str(resolved_file))
            result = await self._speech.transcribe_bytes(audio.audio_bytes, audio.format)
            return result.text

        return self._read_text_fallback(resolved_file)

    @staticmethod
    def _read_text(path: Path) -> str:
        with open(path, "r", encoding="utf-8", errors="replace") as f:
            return f.read()

    @staticmethod
    def _read_text_fallback(path: Path) -> str:
        try:
            return LocalFileSystem._read_text(path)
        except Exception:
            raise ValueError(f"Không hỗ trợ định dạng {path.suffix}")
    
    async def write_file(self, file_path: str, content: str, context: ToolContext, overwrite: bool = False) -> None:
        """
        Ghi nội dung vào tệp trong thư mục người dùng.

        Args:
            file_path: Đường dẫn tương đối của tệp.
            content: Nội dung cần ghi vào tệp.
            context: Ngữ cảnh công cụ chứa thông tin người dùng.
            overwrite: Nếu là True, cho phép ghi đè tệp đã tồn tại.
        """
        resolved_file = self._resolve_path(context, file_path)
        
        # Tạo thư mục cha nếu chưa tồn tại
        resolved_file.parent.mkdir(parents=True, exist_ok=True)

        # kiểm tra xem tệp có tồn tại không, nếu tồn tại và overwrite là False, thì ném lỗi
        if resolved_file.exists() and not overwrite:
            raise ValueError(f"Tệp {file_path} đã tồn tại. Vui lòng đặt overwrite=True để ghi đè.")
        
        with open(resolved_file, 'w', encoding='utf-8') as f:
            f.write(content)

    async def exists(self, file_path: str, context: ToolContext) -> bool:
        """
        Kiểm tra xem tệp có tồn tại trong thư mục người dùng hay không.

        Args:
            file_path: Đường dẫn tương đối của tệp.
            context: Ngữ cảnh công cụ chứa thông tin người dùng.

        Returns:
            True nếu tệp tồn tại, ngược lại False.
        """
        try: 
            resolved_file = self._resolve_path(context, file_path)
            return resolved_file.exists()
        except PermissionError:
            return False
        
    async def is_directory(self, path: str, context: ToolContext) -> bool:
        """
        Kiểm tra xem đường dẫn có phải là một thư mục trong thư mục người dùng hay không.

        Args: 
            path: Đường dẫn tương đối của thư mục.
            context: Ngữ cảnh công cụ chứa thông tin người dùng.
        Returns:
            True nếu đường dẫn là một thư mục, ngược lại False.
        """

        try:
            resolved_path = self._resolve_path(context, path)
            return resolved_path.exists() and resolved_path.is_dir()
        except PermissionError:
            return False
    
    async def search_file(
        self,
        query: str,
        context: ToolContext,
        *,
        max_result: int = 20,
        include_content: bool = False,
    ) -> List[FileSearchMatch]:
        """
        Tìm kiếm file trong không gian người dùng theo tên file và/hoặc nội dung.

        Hàm hỗ trợ:
            - Tìm theo tên file (filename match)
            - Tìm theo nội dung file (content match) nếu include_content=True
            - Giới hạn số lượng kết quả trả về
            - Bỏ qua file lớn để tối ưu hiệu năng

        Args:
            query: Từ khóa tìm kiếm.
            context: Context chứa thông tin user (để xác định thư mục riêng).
            max_result: Số lượng kết quả tối đa trả về.
            include_content: 
                - True: tìm cả trong nội dung file
                - False: chỉ tìm theo tên file (nhanh hơn)

        Returns:
            Danh sách FileSearchMatch gồm:
                - path: đường dẫn file tương đối
                - snippet: đoạn mô tả ngắn (nếu có match)
        """

        # Chuẩn hóa query để tìm kiếm không phân biệt hoa/thường
        trimmed_query = query.strip()
        if not trimmed_query:
            raise ValueError("Search query must not be empty")

        query_lower = trimmed_query.lower()

        # Lấy thư mục riêng của user (cách ly dữ liệu giữa các user)
        user_dir = self._get_user_directory(context)

        # Danh sách kết quả tìm kiếm
        matches: List[FileSearchMatch] = []

        # Duyệt toàn bộ file trong thư mục user (đệ quy)
        for path in user_dir.rglob("*"):

            # Dừng sớm nếu đã đủ số lượng kết quả
            if len(matches) >= max_result:
                break

            # Bỏ qua nếu không phải file
            if not path.is_file():
                continue

            # Đường dẫn tương đối để trả về cho client
            relative_path = path.relative_to(user_dir).as_posix()

            include_entry = False
            snippet: Optional[str] = None

            # 1. Match theo tên file
            if query_lower in path.name.lower():
                include_entry = True
                snippet = FILENAME_MATCH_SNIPPET

            content: Optional[str] = None

            # 2. Nếu bật tìm theo nội dung
            if include_content:
                try:
                    size = path.stat().st_size
                except OSError:
                    # Nếu không đọc được metadata file thì bỏ qua
                    if include_entry:
                        matches.append(
                            FileSearchMatch(path=relative_path, snippet=snippet)
                        )
                    continue

                # Bỏ qua file quá lớn để tránh tốn RAM / I/O
                if size <= MAX_SEARCH_FILE_BYTES:
                    try:
                        content = path.read_text(encoding="utf-8")
                    except (UnicodeDecodeError, OSError):
                        content = None
                else:
                    # File quá lớn: chỉ xử lý nếu đã match theo tên
                    if not include_entry:
                        continue

            # 3. Match theo nội dung file
            if include_content and content is not None:
                if query_lower in content.lower():
                    snippet = _make_snippet(content, trimmed_query) or snippet
                    include_entry = True
                elif not include_entry:
                    continue

            # 4. Nếu file match (tên hoặc nội dung) thì thêm vào kết quả
            if include_entry:
                matches.append(
                    FileSearchMatch(
                        path=relative_path,
                        snippet=snippet
                    )
                )

        return matches


    async def run_bash(
        self,
        command: str,
        context: ToolContext,
        *,
        timeout: Optional[float] = None,
    ) -> CommandResult:
        if not command.strip():
            raise ValueError("Command must not be empty")

        user_dir = self._get_user_directory(context)
        argv = resolve_shell_command(command)

        process: asyncio.subprocess.Process | None = None
        try:
            process = await asyncio.create_subprocess_exec(
                *argv,
                stdin=asyncio.subprocess.DEVNULL,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.STDOUT,
                cwd=str(user_dir),
            )
        except asyncio.CancelledError:
            if process is not None:
                await _terminate_process(process, force=False)
            raise

        try:
            await asyncio.wait_for(process.wait(), timeout=timeout)
        except asyncio.TimeoutError:
            output_buffer = await _drain_available_output(process.stdout)
            await _terminate_process(process, force=True)
            output_buffer.extend(await _read_remaining_output(process.stdout))
            text = _format_timeout_output(output_buffer, timeout=timeout)
            return CommandResult(
                stdout=text,
                stderr="",
                returncode=process.returncode if process.returncode is not None else -1,
            )
        except asyncio.CancelledError:
            await _terminate_process(process, force=False)
            raise

        output_buffer = await _read_remaining_output(process.stdout)
        text = _format_output(output_buffer)
        return CommandResult(
            stdout=text,
            stderr="",
            returncode=process.returncode if process.returncode is not None else 0,
        )


async def _terminate_process(process: asyncio.subprocess.Process, *, force: bool) -> None:
    if process.returncode is not None:
        return
    if force:
        process.kill()
        await process.wait()
        return
    process.terminate()
    try:
        await asyncio.wait_for(process.wait(), timeout=2.0)
    except asyncio.TimeoutError:
        process.kill()
        await process.wait()


async def _read_remaining_output(stream: asyncio.StreamReader | None) -> bytearray:
    output_buffer = bytearray()
    if stream is not None:
        try:
            remaining = await asyncio.wait_for(
                stream.read(),
                timeout=_READ_REMAINING_OUTPUT_TIMEOUT_SECONDS,
            )
        except asyncio.TimeoutError:
            remaining = b""
        output_buffer.extend(remaining)
    return output_buffer


async def _drain_available_output(
    stream: asyncio.StreamReader | None,
    *,
    read_timeout: float = 0.05,
) -> bytearray:
    output_buffer = bytearray()
    if stream is None:
        return output_buffer
    while True:
        try:
            chunk = await asyncio.wait_for(stream.read(65536), timeout=read_timeout)
        except asyncio.TimeoutError:
            return output_buffer
        if not chunk:
            return output_buffer
        output_buffer.extend(chunk)


def _format_output(output_buffer: bytearray) -> str:
    text = output_buffer.decode("utf-8", errors="replace").replace("\r\n", "\n").strip()
    if not text:
        return "(no output)"
    if len(text) > MAX_OUTPUT_CHARS:
        return f"{text[:MAX_OUTPUT_CHARS]}\n...[truncated]..."
    return text


def _format_timeout_output(output_buffer: bytearray, *, timeout: Optional[float]) -> str:
    parts = [f"Command timed out after {timeout} seconds."]
    text = _format_output(output_buffer)
    if text != "(no output)":
        parts.extend(["", "Partial output:", text])
    return "\n".join(parts)