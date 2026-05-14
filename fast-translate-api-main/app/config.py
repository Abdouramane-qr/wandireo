"""
Application configuration loaded from environment variables via pydantic-settings.
A .env file at project root is automatically read when present.
"""
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )

    # --- Security ---
    API_KEY: str  # Required: set in .env or environment variable

    # --- Application metadata ---
    APP_NAME: str = "Translator API"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False


# Singleton instance used across the application
settings = Settings()
