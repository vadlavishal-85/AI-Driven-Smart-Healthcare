import os
from dotenv import load_dotenv
from pymongo import MongoClient
from pymongo.errors import PyMongoError

load_dotenv()

MONGODB_URI = os.getenv("MONGODB_URI", "").strip()
MONGODB_DATABASE = os.getenv("MONGODB_DATABASE", "smarthealthcare")


def get_mongo_client(timeout_ms: int = 5000) -> MongoClient:
    if not MONGODB_URI:
        raise RuntimeError("MongoDB is not configured")
    return MongoClient(
        MONGODB_URI,
        serverSelectionTimeoutMS=timeout_ms,
        connectTimeoutMS=timeout_ms,
    )


def get_mongo_db():
    client = get_mongo_client()
    return client[MONGODB_DATABASE]


def check_mongodb_connection() -> tuple[bool, str]:
    if not MONGODB_URI:
        return False, "not configured (optional)"
    try:
        client = get_mongo_client(timeout_ms=3000)
        # Ping the server to verify connectivity
        client.admin.command("ping")
        client.close()
        return True, "connected"
    except PyMongoError as e:
        return False, f"connection failed: {str(e)}"
    except Exception as e:
        return False, f"connection failed: {str(e)}"
