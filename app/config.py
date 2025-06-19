# app/config.py
import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    ENV: str = os.getenv("ENV", "dev")
    ALLOWED_ORIGINS = ["http://localhost:3000"]

settings = Settings()
