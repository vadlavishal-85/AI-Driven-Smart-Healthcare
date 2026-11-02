import logging
from pymongo import MongoClient
from pymongo.collection import Collection
from pymongo.database import Database
from app.core.config import settings

import time
logger = logging.getLogger(__name__)

# Initialize MongoDB client with responsive timeout
mongo_client: MongoClient = MongoClient(
    settings.MONGODB_URI,
    serverSelectionTimeoutMS=1000,
)

# Select database
mongo_db: Database = mongo_client[settings.MONGODB_DATABASE]

# Provide access to existing healthcare document collections
medical_records_collection: Collection = mongo_db["medical_records"]
prescriptions_collection: Collection = mongo_db["prescriptions"]
doctor_notes_collection: Collection = mongo_db["doctor_notes"]
lab_reports_collection: Collection = mongo_db["lab_reports"]

_last_ping_time: float = 0.0
_is_connected: bool = False


def get_mongodb() -> Database:
    """
    Returns the active MongoDB database instance.
    """
    return mongo_db


def check_mongodb_connection() -> bool:
    """
    Verifies that the MongoDB server is reachable using a ping command.
    Caches connection state for 10 seconds to avoid multi-second thread blocks.
    """
    global _last_ping_time, _is_connected
    now = time.time()
    if now - _last_ping_time < 10.0:
        return _is_connected

    _last_ping_time = now
    try:
        mongo_client.admin.command("ping")
        _is_connected = True
        return True
    except Exception as e:
        logger.warning(f"MongoDB connection check failed: {e}")
        _is_connected = False
        return False

