import logging
from pymongo import MongoClient
from pymongo.collection import Collection
from pymongo.database import Database
from app.core.config import settings

logger = logging.getLogger(__name__)

# Initialize MongoDB client
mongo_client: MongoClient = MongoClient(
    settings.MONGODB_URI,
    serverSelectionTimeoutMS=5000,
)

# Select database
mongo_db: Database = mongo_client[settings.MONGODB_DATABASE]

# Provide access to existing healthcare document collections
medical_records_collection: Collection = mongo_db["medical_records"]
prescriptions_collection: Collection = mongo_db["prescriptions"]
doctor_notes_collection: Collection = mongo_db["doctor_notes"]
lab_reports_collection: Collection = mongo_db["lab_reports"]


def get_mongodb() -> Database:
    """
    Returns the active MongoDB database instance.
    """
    return mongo_db


def check_mongodb_connection() -> bool:
    """
    Verifies that the MongoDB server is reachable using a ping command.
    Returns True if connected, False on error.
    """
    try:
        mongo_client.admin.command("ping")
        return True
    except Exception as e:
        logger.error(f"MongoDB connection error: {e}")
        return False
