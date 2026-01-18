import logging
import sys
from typing import Optional

# Configure formatting
LOG_FORMAT = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"

def get_logger(name: str, level: int = logging.INFO) -> logging.Logger:
    """
    Get a configured logger instance.
    """
    logger = logging.getLogger(name)
    logger.setLevel(level)
    
    # Check if handler exists to avoid duplicate logs
    if not logger.handlers:
        handler = logging.StreamHandler(sys.stdout)
        handler.setFormatter(logging.Formatter(LOG_FORMAT))
        logger.addHandler(handler)
        
    return logger

# Global App Logger
logger = get_logger("aadhaar_sanket_backend")
