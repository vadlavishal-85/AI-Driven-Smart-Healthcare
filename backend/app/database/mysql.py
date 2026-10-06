"""SQLAlchemy connection setup for Render Postgres or an existing MySQL DB."""

import os
import urllib.parse

from dotenv import load_dotenv
from sqlalchemy import create_engine, text
from sqlalchemy.orm import declarative_base, sessionmaker

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "").strip()
MYSQL_HOST = os.getenv("MYSQL_HOST", "localhost")
MYSQL_PORT = os.getenv("MYSQL_PORT", "3306")
MYSQL_DATABASE = os.getenv("MYSQL_DATABASE", "smarthealthcare")
MYSQL_USER = os.getenv("MYSQL_USER", "")
MYSQL_PASSWORD = os.getenv("MYSQL_PASSWORD", "")

Base = declarative_base()


class DatabaseUnavailableError(Exception):
    """Raised when an API operation needs a database that is not configured."""


def get_mysql_url(include_db: bool = True) -> str:
    """Build the legacy MySQL URL when DATABASE_URL is not configured."""
    encoded_user = urllib.parse.quote_plus(MYSQL_USER)
    encoded_password = urllib.parse.quote_plus(MYSQL_PASSWORD)
    db_part = f"/{MYSQL_DATABASE}" if include_db else ""
    return f"mysql+pymysql://{encoded_user}:{encoded_password}@{MYSQL_HOST}:{MYSQL_PORT}{db_part}"


def _normalize_database_url(url: str) -> str:
    # Render provides postgresql:// URLs. Pin the SQLAlchemy dialect to psycopg 3.
    if url.startswith("postgres://"):
        return "postgresql+psycopg://" + url.removeprefix("postgres://")
    if url.startswith("postgresql://"):
        return "postgresql+psycopg://" + url.removeprefix("postgresql://")
    return url


def _configured_database_url() -> str | None:
    if DATABASE_URL:
        return _normalize_database_url(DATABASE_URL)
    if MYSQL_USER:
        return get_mysql_url()
    return None


def create_database_engine():
    url = _configured_database_url()
    if not url:
        return None

    connect_args = {}
    if url.startswith("mysql+"):
        connect_args["connect_timeout"] = 5
    elif url.startswith("sqlite:") and ":memory:" not in url:
        connect_args["check_same_thread"] = False

    return create_engine(
        url,
        pool_pre_ping=True,
        pool_recycle=3600,
        connect_args=connect_args,
    )


engine = create_database_engine()
SessionLocal = (
    sessionmaker(autocommit=False, autoflush=False, bind=engine)
    if engine is not None
    else None
)


def get_db():
    """FastAPI dependency for obtaining a relational database session."""
    if SessionLocal is None:
        raise DatabaseUnavailableError("DATABASE_URL or MYSQL_USER is not configured.")
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def check_database_connection() -> tuple[bool, str]:
    if engine is None:
        return False, "Database connection is not configured"

    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        return True, "connected"
    except Exception as exc:
        # Avoid returning connection strings, usernames, or passwords to clients.
        return False, f"connection failed ({type(exc).__name__})"


# Kept as a compatibility alias while existing MySQL deployments migrate.
check_mysql_connection = check_database_connection
