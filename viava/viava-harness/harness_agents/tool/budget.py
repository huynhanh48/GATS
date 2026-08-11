from pydantic import BaseModel

class ToolBudget(BaseModel):
    max_result_chars: int = 100_000
    spill_threshold_chars: int = 50_000
    max_turn_chars: int = 200_000
    max_lines: int = 500
    max_line_length: int = 2_000
    spill_dir: str = ""