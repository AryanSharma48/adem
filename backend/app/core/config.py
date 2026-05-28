from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    DATABASE_URL: str
    AQICN_API_TOKEN: str
    TELEGRAM_BOT_TOKEN: str
    TELEGRAM_CHAT_ID: str

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

settings = Settings()
