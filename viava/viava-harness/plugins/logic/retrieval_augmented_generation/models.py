from pydantic import BaseModel, ConfigDict, Field

class KeywordExtraction(BaseModel):
    """LLM structured output cho keyword extraction"""
    model_config = ConfigDict(extra="forbid")

    hl_keywords: list[str] = Field(
        default_factory=list,
        alias="high_level_keywords",
        validation_alias="high_level_keywords",
    )
    ll_keywords: list[str] = Field(
        default_factory=list,
        alias="low_level_keywords",
        validation_alias="low_level_keywords",
    )


