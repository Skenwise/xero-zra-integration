from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    XERO_CLIENT_ID: Optional[str] = None
    XERO_CLIENT_SECRET: Optional[str] = None
    XERO_REDIRECT_URI: Optional[str] = None

    class Config:
        env_file = ".env"
        env_file_encoding = 'utf-8'
        case_sensitive = True

def get_settings():
    return Settings()

