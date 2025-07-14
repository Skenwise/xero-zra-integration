from pydantic_settings import BaseSettings
import os
from typing import Optional

class Settings(BaseSettings):
    XERO_CLIENT_ID: Optional[str]
    XERO_CLIENT_SECRET: Optional[str]
    XERO_REDIRECT_URI: Optional[str]

    class connfig:
        env_file = ".env"

def get_settings():
    return Settings()