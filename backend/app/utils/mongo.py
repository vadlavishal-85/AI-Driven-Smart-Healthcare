from typing import Dict, Any
from bson import ObjectId
from fastapi import HTTPException, status


def parse_object_id(id_str: str) -> ObjectId:
    """
    Validates a string as a MongoDB ObjectId and returns the ObjectId instance.
    Raises 400 Bad Request if invalid.
    """
    if not ObjectId.is_valid(id_str):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid record identifier format",
        )
    return ObjectId(id_str)


def format_doc(doc: Dict[str, Any]) -> Dict[str, Any]:
    """
    Transforms a MongoDB document for Pydantic response:
    maps '_id' ObjectId to 'id' string.
    """
    if not doc:
        return doc
    doc_copy = dict(doc)
    if "_id" in doc_copy:
        doc_copy["id"] = str(doc_copy.pop("_id"))
    return doc_copy
