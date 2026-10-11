import os
from dotenv import load_dotenv
from pydantic import BaseModel

# Load environment variables from .env file
load_dotenv()


class Settings(BaseModel):
    PROJECT_NAME: str = "AI-Driven Smart Healthcare Data Exchange and Analytics Ecosystem"
    PROJECT_DESCRIPTION: str = (
        "Backend API for the healthcare data exchange and analytics ecosystem."
    )
    API_VERSION: str = "1.0.0"
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")

    # PostgreSQL Configuration
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "postgresql://postgres:postgres@localhost:5432/ai_smart_healthcare",
    )

    # MongoDB Configuration
    MONGODB_URI: str = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
    MONGODB_DATABASE: str = os.getenv("MONGODB_DATABASE", "ai_smart_healthcare")

    # JWT Authentication Configuration
    JWT_SECRET_KEY: str = os.getenv("JWT_SECRET_KEY", "")
    JWT_ALGORITHM: str = os.getenv("JWT_ALGORITHM", "HS256")
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = int(
        os.getenv("JWT_ACCESS_TOKEN_EXPIRE_MINUTES", "60")
    )

    # CORS Configuration
    CORS_ORIGINS: str = os.getenv(
        "CORS_ORIGINS",
        "http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173,https://smarthealthcare-frontend.onrender.com",
    )

    @property
    def cors_origins_list(self) -> list[str]:
        raw = self.CORS_ORIGINS or ""
        if raw.strip() == "*":
            return ["*"]
        origins = [origin.strip() for origin in raw.split(",") if origin.strip()]
        return origins if origins else ["*"]


settings = Settings()

