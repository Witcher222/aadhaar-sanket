"""
Aadhaar Sanket Backend - Custom Exceptions
"""

class AadhaarSanketError(Exception):
    """Base exception for Aadhaar Sanket backend"""
    pass


class DataIngestionError(AadhaarSanketError):
    """Raised when data ingestion fails"""
    pass


class DataClassificationError(AadhaarSanketError):
    """Raised when CSV classification fails"""
    pass


class DataValidationError(AadhaarSanketError):
    """Raised when data validation fails"""
    pass


class PipelineError(AadhaarSanketError):
    """Raised when pipeline execution fails"""
    pass


class ProcessedDataNotFoundError(AadhaarSanketError):
    """Raised when processed data is not found"""
    pass


class AIServiceError(AadhaarSanketError):
    """Raised when AI service (Gemini) fails"""
    pass


class ConfigurationError(AadhaarSanketError):
    """Raised when configuration is invalid"""
    pass


class FileUploadError(AadhaarSanketError):
    """Raised when file upload fails"""
    pass
