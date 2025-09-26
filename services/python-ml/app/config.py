"""Configuration settings for ML microservice"""

from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    # Service configuration
    SERVICE_NAME: str = "ml-ai-microservice"
    DEBUG: bool = False
    LOG_LEVEL: str = "INFO"
    
    # Database connections
    SUPABASE_URL: str
    SUPABASE_ANON_KEY: str
    SUPABASE_SERVICE_ROLE_KEY: str
    
    # Redis configuration
    REDIS_URL: str = "redis://redis:6379/0"
    
    # ML/AI API keys
    OPENAI_API_KEY: Optional[str] = None
    ANTHROPIC_API_KEY: Optional[str] = None
    HUGGINGFACE_API_KEY: Optional[str] = None
    
    # Model storage
    MODEL_STORAGE_PATH: str = "/app/models"
    CACHE_TTL: int = 3600
    
    # Processing limits
    MAX_IMAGE_SIZE: int = 10 * 1024 * 1024  # 10MB
    MAX_BATCH_SIZE: int = 32
    PROCESSING_TIMEOUT: int = 300  # 5 minutes
    
    # Monitoring
    PROMETHEUS_PORT: int = 9090
    HEALTH_CHECK_TIMEOUT: int = 30
    
    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()