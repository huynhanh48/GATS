class LLMError(Exception):
    def __init__(self, message: str, cause: Exception | None = None):
        super().__init__(message)
        self.cause = cause

class LLMConnectionError(LLMError):
    pass

class LLMAuthenticationError(LLMError):
    pass

class LLMRateLimitError(LLMError):
    pass

class LLMContextLengthError(LLMError):
    pass

class LLMBadRequestError(LLMError):
    pass

class LLMInvalidResponseError(LLMError):
    pass

