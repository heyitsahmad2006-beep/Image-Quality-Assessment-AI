import os
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
DB_PATH = os.path.join(BASE_DIR, "app.db")

class Settings(BaseSettings):
    APP_NAME: str = "Image Quality Assessment AI"
    APP_ENV: str = "development"
    DEBUG: bool = False
    SECRET_KEY: str = "iqa_super_secret_jwt_key_change_in_production_2026"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440
    DATABASE_URL: str = f"sqlite:///{DB_PATH}"
    
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://192.168.0.200:5173",
        "http://192.168.1.239:5173",
        "http://localhost:3000",
        "http://192.168.0.200:8000"
    ]
    MAX_UPLOAD_MB: int = 15
    MODEL_PATH: str = "../ml/weights/best_model.pt"
    FUSION_CONFIG_PATH: str = "../ml/configs/fusion_weights.yaml"
    INFERENCE_DEVICE: str = "auto"
    STORE_GUEST_IMAGES: bool = False

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()
