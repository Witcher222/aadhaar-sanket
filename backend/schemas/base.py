from typing import Generic, TypeVar, Optional, Any
from pydantic import BaseModel, Field
from datetime import datetime

T = TypeVar("T")

class MetaData(BaseModel):
    """Standard metadata for API responses."""
    timestamp: datetime = Field(default_factory=datetime.now)
    version: str = "1.0"
    request_id: Optional[str] = None

class APIResponse(BaseModel, Generic[T]):
    """
    Standardized API Response Wrapper.
    All successful responses should be wrapped in this.
    """
    status: str = Field(..., pattern="^(success|error|fail)$")
    data: Optional[T] = None
    message: Optional[str] = None
    meta: MetaData = Field(default_factory=MetaData)

class ErrorResponse(BaseModel):
    """Standard Error Response."""
    status: str = "error"
    code: int
    message: str
    details: Optional[Any] = None
    meta: MetaData = Field(default_factory=MetaData)
