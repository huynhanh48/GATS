from pydantic import BaseModel

class PPRParam(BaseModel):
    damping: float = 0.85
    max_iter: int = 100
    tol: float = 1e-6