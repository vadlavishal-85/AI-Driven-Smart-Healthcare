import os
from datetime import datetime, timedelta, timezone
from typing import Optional
import bcrypt
from dotenv import load_dotenv
import jwt

load_dotenv()

APP_ENV = os.getenv("APP_ENV", "development").strip().lower()
_DEVELOPMENT_SECRET_KEY = "smarthealthcare-super-secure-dev-secret-key-32-chars-minimum-2026"
_configured_secret_key = os.getenv("SECRET_KEY", "").strip()

if APP_ENV in {"prod", "production"}:
    if len(_configured_secret_key) < 32 or _configured_secret_key == _DEVELOPMENT_SECRET_KEY:
        raise RuntimeError("Production requires a unique SECRET_KEY of at least 32 characters.")
    SECRET_KEY = _configured_secret_key
else:
    SECRET_KEY = _configured_secret_key or _DEVELOPMENT_SECRET_KEY

ALGORITHM = "HS256"
try:
    ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))
except ValueError as exc:
    raise RuntimeError("ACCESS_TOKEN_EXPIRE_MINUTES must be a positive integer.") from exc

if ACCESS_TOKEN_EXPIRE_MINUTES < 1:
    raise RuntimeError("ACCESS_TOKEN_EXPIRE_MINUTES must be a positive integer.")


def hash_password(password: str) -> str:
    """Securely hash a plain text password using bcrypt."""
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode("utf-8"), salt).decode("utf-8")


def verify_password(plain_password: str, password_hash: str) -> bool:
    """Verify a plain text password against a stored bcrypt hash."""
    try:
        return bcrypt.checkpw(plain_password.encode("utf-8"), password_hash.encode("utf-8"))
    except Exception:
        return False


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Generate a signed JWT access token containing subject, role, and expiration."""
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def decode_access_token(token: str) -> Optional[dict]:
    """Decode and validate a JWT access token."""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except jwt.PyJWTError:
        return None
