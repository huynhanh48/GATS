import os
import platform
import shutil
import subprocess
from enum import Enum


class PlatformName(Enum):
    WINDOWS = "windows"
    LINUX = "linux"
    MACOS = "macos"
    WSL = "wsl"
    UNKNOWN = "unknown"


def detect_platform() -> PlatformName:
    system = platform.system()
    if system == "Windows":
        return PlatformName.WINDOWS
    if system == "Darwin":
        return PlatformName.MACOS
    if system == "Linux":
        release = platform.uname().release.lower()
        if "microsoft" in release or "WSL_DISTRO_NAME" in os.environ:
            return PlatformName.WSL
        return PlatformName.LINUX
    return PlatformName.UNKNOWN


def _bash_is_usable(bash_path: str) -> bool:
    try:
        result = subprocess.run(
            [bash_path, "-lc", "exit 0"],
            capture_output=True,
            timeout=5,
        )
        return result.returncode == 0
    except (subprocess.SubprocessError, OSError):
        return False


def resolve_shell_command(command: str) -> list[str]:
    plat = detect_platform()

    if plat == PlatformName.WINDOWS:
        bash = shutil.which("bash")
        if bash and _bash_is_usable(bash):
            return [bash, "-lc", command]
        pwsh = shutil.which("pwsh") or shutil.which("powershell")
        if pwsh:
            return [pwsh, "-NoLogo", "-NoProfile", "-Command", command]
        return ["cmd.exe", "/d", "/s", "/c", command]

    bash = shutil.which("bash")
    if bash:
        return [bash, "-lc", command]
    sh = shutil.which("sh")
    if sh:
        return [sh, "-lc", command]
    return [command]
