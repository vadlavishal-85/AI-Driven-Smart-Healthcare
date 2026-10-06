import os
from functools import lru_cache
from dotenv import load_dotenv
from pymongo import MongoClient
from pymongo.errors import PyMongoError

load_dotenv()

MONGODB_URI = os.getenv("MONGODB_URI", "").strip()
MONGODB_DATABASE = os.getenv("MONGODB_DATABASE", "smarthealthcare")


class MongoDBUnavailableError(RuntimeError):
    """Raised when an operation that requires MongoDB cannot use it."""


@lru_cache(maxsize=1)
def get_mongo_client() -> MongoClient:
    if not MONGODB_URI:
        raise MongoDBUnavailableError("MongoDB is not configured. Add MONGODB_URI to the API environment.")
    return MongoClient(
        MONGODB_URI,
        serverSelectionTimeoutMS=5000,
        connectTimeoutMS=5000,
    )


def get_mongo_db(required: bool = True):
    if not MONGODB_URI and not required:
        return None
    return get_mongo_client()[MONGODB_DATABASE]


def check_mongodb_connection() -> tuple[bool, str]:
    if not MONGODB_URI:
        return False, "not configured"
    try:
        client = get_mongo_client()
        client.admin.command("ping")
        return True, "connected"
    except PyMongoError as e:
        return False, f"connection failed ({type(e).__name__})"
    except MongoDBUnavailableError as e:
        return False, str(e)
    except Exception as e:
        return False, f"connection failed ({type(e).__name__})"


@lru_cache(maxsize=2)
def get_clinical_database(required: bool = True):
    """Return MongoDB after preparing indexes used by clinical workflows."""
    db = get_mongo_db(required=required)
    if db is None:
        return None
    db.clinical_records.create_index("appointment_id", unique=True)
    db.prescriptions.create_index("prescription_id", unique=True)
    db.prescriptions.create_index([("patient_id", 1), ("created_at", -1)])
    db.prescriptions.create_index([("doctor_id", 1), ("created_at", -1)])
    db.prescription_notes.create_index([("author_id", 1), ("prescription_code", 1)], unique=True)
    db.data_exchange.create_index("share_id", unique=True)
    db.data_exchange.create_index([("patient_id", 1), ("created_at", -1)])
    db.data_exchange.create_index([("doctor_id", 1), ("created_at", -1)])
    return db
