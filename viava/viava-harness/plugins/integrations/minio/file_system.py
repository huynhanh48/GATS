import asyncio
import hashlib
import os
import tempfile
from io import BytesIO
from pathlib import Path
from typing import List, Optional

from minio import Minio
from minio.error import S3Error

from capabilities.file_system import FileSystem, FileSearchMatch, CommandResult
from core.tool import ToolContext
from utils.platform import resolve_shell_command

_READ_REMAINING_OUTPUT_TIMEOUT_SECONDS = 2.0
MAX_OUTPUT_CHARS = 12_000
MAX_SEARCH_FILE_BYTES = 1_000_000
FILENAME_MATCH_SNIPPET = "[filename match]"


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


class MinioFileSystem(FileSystem):

    def __init__(
        self,
        endpoint: str,
        access_key: str,
        secret_key: str,
        bucket: str,
        secure: bool = True,
        region: Optional[str] = None,
        temp_base_dir: Optional[str] = None,
    ):
        self._endpoint = endpoint
        self._access_key = access_key
        self._secret_key = secret_key
        self._bucket = bucket
        self._secure = secure
        self._region = region
        self._temp_base_dir = (
            Path(temp_base_dir)
            if temp_base_dir
            else Path(tempfile.gettempdir()) / "minio-fs"
        )
        self._client: Optional[Minio] = None

    def _get_client(self) -> Minio:
        if self._client is None:
            self._client = Minio(
                self._endpoint,
                access_key=self._access_key,
                secret_key=self._secret_key,
                secure=self._secure,
                region=self._region,
            )
            if not self._client.bucket_exists(self._bucket):
                self._client.make_bucket(self._bucket)
        return self._client

    def _get_user_prefix(self, context: ToolContext) -> str:
        user_hash = hashlib.sha256(context.user.id.encode()).hexdigest()[:16]
        return f"{user_hash}/"

    def _get_user_temp_dir(self, context: ToolContext) -> Path:
        user_hash = hashlib.sha256(context.user.id.encode()).hexdigest()[:16]
        path = self._temp_base_dir / user_hash
        path.mkdir(parents=True, exist_ok=True)
        return path

    def _to_object_key(self, context: ToolContext, relative_path: str) -> str:
        prefix = self._get_user_prefix(context)
        normalized = relative_path.replace("\\", "/")
        resolved = os.path.normpath(normalized)
        if resolved.startswith("..") or resolved.startswith("/"):
            raise ValueError(f"Invalid path: {relative_path}")
        return f"{prefix}{resolved}"

    def _from_object_key(self, context: ToolContext, key: str) -> str:
        prefix = self._get_user_prefix(context)
        if not key.startswith(prefix):
            raise ValueError(f"Key {key} is outside user prefix")
        return key[len(prefix):]

    async def _sync_minio_to_local(self, context: ToolContext) -> Path:
        client = self._get_client()
        temp_dir = self._get_user_temp_dir(context)
        prefix = self._get_user_prefix(context)

        try:
            objects = client.list_objects(self._bucket, prefix=prefix, recursive=True)
            for obj in objects:
                relative_path = self._from_object_key(context, obj.object_name)
                local_path = temp_dir / relative_path
                local_path.parent.mkdir(parents=True, exist_ok=True)
                client.fget_object(self._bucket, obj.object_name, str(local_path))
        except S3Error:
            pass

        return temp_dir

    async def _sync_local_to_minio(self, context: ToolContext, temp_dir: Path) -> None:
        client = self._get_client()
        prefix = self._get_user_prefix(context)

        for local_path in temp_dir.rglob("*"):
            if not local_path.is_file():
                continue
            relative = local_path.relative_to(temp_dir).as_posix()
            object_key = f"{prefix}{relative}"
            client.fput_object(self._bucket, object_key, str(local_path))

    async def list_files(self, directory_path: str, context: ToolContext) -> List[str]:
        client = self._get_client()
        prefix = self._to_object_key(context, directory_path)
        if not prefix.endswith("/"):
            prefix = prefix + "/"

        try:
            objects = client.list_objects(self._bucket, prefix=prefix, recursive=False)
        except S3Error:
            raise ValueError(f"Directory {directory_path} does not exist")

        files = []
        for obj in objects:
            name = obj.object_name[len(prefix):]
            if name and not name.endswith("/"):
                files.append(name)

        return sorted(files)

    async def read_file(self, filename: str, context: ToolContext) -> str:
        client = self._get_client()
        object_key = self._to_object_key(context, filename)

        try:
            response = client.get_object(self._bucket, object_key)
            content = response.read().decode("utf-8")
            response.close()
            response.release_conn()
            return content
        except S3Error as e:
            if e.code == "NoSuchKey":
                raise ValueError(f"File {filename} does not exist")
            raise

    async def write_file(
        self,
        filename: str,
        content: str,
        context: ToolContext,
        overwrite: bool = False,
    ) -> None:
        client = self._get_client()
        object_key = self._to_object_key(context, filename)

        if not overwrite:
            try:
                client.stat_object(self._bucket, object_key)
                raise ValueError(
                    f"File {filename} already exists. "
                    "Set overwrite=True to overwrite."
                )
            except S3Error as e:
                if e.code != "NoSuchKey":
                    raise

        data = content.encode("utf-8")
        client.put_object(
            self._bucket,
            object_key,
            BytesIO(data),
            length=len(data),
            content_type="text/plain; charset=utf-8",
        )

    async def exists(self, path: str, context: ToolContext) -> bool:
        client = self._get_client()
        object_key = self._to_object_key(context, path)

        try:
            client.stat_object(self._bucket, object_key)
            return True
        except S3Error:
            prefix = object_key if object_key.endswith("/") else f"{object_key}/"
            try:
                objects = client.list_objects(
                    self._bucket, prefix=prefix, max_keys=1
                )
                return any(objects)
            except S3Error:
                return False

    async def is_directory(self, directory_path: str, context: ToolContext) -> bool:
        client = self._get_client()
        prefix = self._to_object_key(context, directory_path)
        if not prefix.endswith("/"):
            prefix = prefix + "/"

        try:
            objects = client.list_objects(self._bucket, prefix=prefix, max_keys=1)
            return any(objects)
        except S3Error:
            return False

    async def search_file(
        self,
        query: str,
        context: ToolContext,
        *,
        max_result: int = 20,
        include_content: bool = False,
    ) -> List[FileSearchMatch]:
        trimmed_query = query.strip()
        if not trimmed_query:
            raise ValueError("Search query must not be empty")

        query_lower = trimmed_query.lower()
        client = self._get_client()
        prefix = self._get_user_prefix(context)
        matches: List[FileSearchMatch] = []

        try:
            objects = client.list_objects(self._bucket, prefix=prefix, recursive=True)
        except S3Error:
            return matches

        for obj in objects:
            if len(matches) >= max_result:
                break

            if obj.is_dir:
                continue

            relative_path = self._from_object_key(context, obj.object_name)
            include_entry = False
            snippet: Optional[str] = None

            if query_lower in Path(relative_path).name.lower():
                include_entry = True
                snippet = FILENAME_MATCH_SNIPPET

            if include_content:
                size = obj.size
                if 0 < size <= MAX_SEARCH_FILE_BYTES:
                    try:
                        response = client.get_object(
                            self._bucket, obj.object_name
                        )
                        content = response.read().decode("utf-8")
                        response.close()
                        response.release_conn()
                    except (UnicodeDecodeError, S3Error):
                        content = None
                else:
                    if not include_entry:
                        continue
                    content = None

                if content is not None and query_lower in content.lower():
                    snippet = _make_snippet(content, trimmed_query) or snippet
                    include_entry = True
                elif not include_entry:
                    continue

            if include_entry:
                matches.append(
                    FileSearchMatch(path=relative_path, snippet=snippet)
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

        temp_dir = await self._sync_minio_to_local(context)
        argv = resolve_shell_command(command)

        process: asyncio.subprocess.Process | None = None
        try:
            process = await asyncio.create_subprocess_exec(
                *argv,
                stdin=asyncio.subprocess.DEVNULL,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.STDOUT,
                cwd=str(temp_dir),
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
            await self._sync_local_to_minio(context, temp_dir)
            return CommandResult(
                stdout=text,
                stderr="",
                returncode=(
                    process.returncode if process.returncode is not None else -1
                ),
            )
        except asyncio.CancelledError:
            await _terminate_process(process, force=False)
            raise

        output_buffer = await _read_remaining_output(process.stdout)
        text = _format_output(output_buffer)
        await self._sync_local_to_minio(context, temp_dir)

        return CommandResult(
            stdout=text,
            stderr="",
            returncode=process.returncode if process.returncode is not None else 0,
        )


async def _terminate_process(
    process: asyncio.subprocess.Process, *, force: bool
) -> None:
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


async def _read_remaining_output(
    stream: asyncio.StreamReader | None,
) -> bytearray:
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
            chunk = await asyncio.wait_for(
                stream.read(65536), timeout=read_timeout
            )
        except asyncio.TimeoutError:
            return output_buffer
        if not chunk:
            return output_buffer
        output_buffer.extend(chunk)


def _format_output(output_buffer: bytearray) -> str:
    text = (
        output_buffer.decode("utf-8", errors="replace")
        .replace("\r\n", "\n")
        .strip()
    )
    if not text:
        return "(no output)"
    if len(text) > MAX_OUTPUT_CHARS:
        return f"{text[:MAX_OUTPUT_CHARS]}\n...[truncated]..."
    return text


def _format_timeout_output(
    output_buffer: bytearray, *, timeout: Optional[float]
) -> str:
    parts = [f"Command timed out after {timeout} seconds."]
    text = _format_output(output_buffer)
    if text != "(no output)":
        parts.extend(["", "Partial output:", text])
    return "\n".join(parts)
