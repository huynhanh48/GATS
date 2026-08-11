import re
from collections import deque


def validate_sql(sql: str) -> str | None:
    if not sql or not sql.strip():
        return "SQL query is empty"

    stack = deque()
    for ch in sql:
        if ch == "(":
            stack.append(ch)
        elif ch == ")":
            if not stack:
                return "Unbalanced parentheses"
            stack.pop()

    if stack:
        return "Unbalanced parentheses"

    if sql.count("'") % 2 != 0:
        return "Unbalanced single quotes"

    if sql.count('"') % 2 != 0:
        return "Unbalanced double quotes"

    return None


_SQL_KEYWORDS = {
    "select", "from", "where", "join", "inner", "left", "right", "outer",
    "on", "and", "or", "not", "in", "is", "null", "like", "between",
    "group", "by", "order", "having", "limit", "offset", "union", "all",
    "as", "distinct", "count", "sum", "avg", "min", "max",
    "case", "when", "then", "else", "end",
    "exists", "with", "asc", "desc", "cast", "coalesce", "nullif",
}


def normalize_sql(sql: str) -> str:
    result = sql.strip()
    result = re.sub(r"\s+", " ", result)

    stripped = result.lstrip()
    first_word = stripped.split(maxsplit=1)[0].upper() if stripped else ""
    if first_word not in ("SELECT", "WITH"):
        raise ValueError(
            f"Only SELECT and WITH statements are allowed, got: {first_word}"
        )

    pattern = r"\b(?:" + "|".join(re.escape(k) for k in _SQL_KEYWORDS) + r")\b"
    result = re.sub(pattern, lambda m: m.group(0).upper(), result, flags=re.IGNORECASE)
    return result
