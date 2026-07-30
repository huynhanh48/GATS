from __future__ import annotations

RESET = "\033[0m"
BOLD = "\033[1m"
DIM = "\033[2m"
ITALIC = "\033[3m"

BLACK = "\033[30m"
RED = "\033[31m"
GREEN = "\033[32m"
YELLOW = "\033[33m"
BLUE = "\033[34m"
MAGENTA = "\033[35m"
CYAN = "\033[36m"
WHITE = "\033[37m"
GRAY = "\033[90m"
BRIGHT_RED = "\033[91m"
BRIGHT_GREEN = "\033[92m"
BRIGHT_YELLOW = "\033[93m"
BRIGHT_BLUE = "\033[94m"
BRIGHT_MAGENTA = "\033[95m"
BRIGHT_CYAN = "\033[96m"
BRIGHT_WHITE = "\033[97m"


def styled(text: str, *styles: str) -> str:
    return "".join(styles) + str(text) + RESET


def ok() -> str:
    return styled("OK", GREEN)


def err() -> str:
    return styled("ERR", RED)


def banner(text: str) -> str:
    width = 50
    line = styled("─" * width, DIM)
    return f"\n{line}\n{styled(text, BOLD, BRIGHT_CYAN)}\n{line}"


def boot_line(label: str, message: str) -> str:
    return f"  {styled(label, BRIGHT_BLUE)} {message}"


def tool_start(name: str) -> str:
    return f"  {styled('◆', CYAN)} {styled(name, BRIGHT_CYAN)} "


def tool_done(name: str, is_error: bool = False, output: str = "") -> str:
    symbol = styled("✕", RED) if is_error else styled("✔", GREEN)
    short_name = name if len(name) <= 36 else name[:33] + "..."
    out = f"  {symbol} {styled(short_name, GRAY)}"
    if output:
        preview = output.replace("\n", " ").replace("\r", " ").strip()
        if len(preview) > 80:
            preview = preview[:77] + "..."
        out += f"  {styled(preview, DIM)}"
    return out


def user_prompt() -> str:
    return f"\n{styled('You', BOLD, BRIGHT_GREEN)}: "


def agent_prompt() -> str:
    return f"\n{styled('Agent', BOLD, BRIGHT_BLUE)}: "


def system_info(text: str) -> str:
    return styled(text, GRAY)


def separator(char: str = "─", width: int = 60) -> str:
    return styled(char * width, DIM)


def warn(text: str) -> str:
    return styled(text, YELLOW)


def bye() -> str:
    return styled("Bye!", BOLD, MAGENTA)
