from pathlib import Path
import os
import hashlib



def get_config_dir() -> Path:
    path = Path(os.environ.get("HARNESS_AGENTS_CONFIG_DIR", Path.home() / ".harness-agents"))
    path.mkdir(parents=True, exist_ok=True)
    return path


def get_data_dir() -> Path:
    path = Path(os.environ.get("HARNESS_AGENTS_DATA_DIR", get_config_dir() / "data"))
    path.mkdir(parents=True, exist_ok=True)
    return path


def get_settings_path() -> Path:
    return get_config_dir() / "settings.json"


def get_credentials_path() -> Path:
    return get_config_dir() / "credentials.json"


def get_sessions_dir() -> Path:
    path = get_data_dir() / "sessions"
    path.mkdir(parents=True, exist_ok=True)
    return path


def get_memory_dir() -> Path:
    path = get_data_dir() / "memory"
    path.mkdir(parents=True, exist_ok=True)
    return path


def get_tasks_dir() -> Path:
    path = get_data_dir() / "tasks"
    path.mkdir(parents=True, exist_ok=True)
    return path


def get_teams_dir() -> Path:
    path = get_config_dir() / "teams"
    path.mkdir(parents=True, exist_ok=True)
    return path


def _project_slug(cwd: str | Path) -> str:
    resolved = Path(cwd).resolve()
    name = resolved.name
    sha1 = hashlib.sha1(str(resolved).encode("utf-8")).hexdigest()[:12]
    return f"{name}-{sha1}"


def get_project_session_dir(cwd: str | Path) -> Path:
    path = get_sessions_dir() / _project_slug(cwd)
    path.mkdir(parents=True, exist_ok=True)
    return path


def get_project_memory_dir(cwd: str | Path) -> Path:
    path = get_memory_dir() / _project_slug(cwd)
    path.mkdir(parents=True, exist_ok=True)
    return path


def get_identity_path() -> Path:
    return get_config_dir() / "identity.md"


def get_user_dir(username: str) -> Path:
    path = get_config_dir() / "user" / username
    path.mkdir(parents=True, exist_ok=True)
    return path


def get_user_sessions_dir(username: str) -> Path:
    path = get_user_dir(username) / "sessions"
    path.mkdir(parents=True, exist_ok=True)
    return path


def get_user_memory_dir(username: str) -> Path:
    path = get_user_dir(username) / "memory"
    path.mkdir(parents=True, exist_ok=True)
    return path


def get_user_tasks_dir(username: str) -> Path:
    path = get_user_dir(username) / "tasks"
    path.mkdir(parents=True, exist_ok=True)
    return path


def get_user_tool_results_dir(username: str) -> Path:
    path = get_user_dir(username) / "tool-results"
    path.mkdir(parents=True, exist_ok=True)
    return path
