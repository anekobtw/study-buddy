from typing import Any, Dict

from fastapi import APIRouter

from app.core.firebase import is_firebase_initialized, is_firestore_available

router = APIRouter()


@router.get("/health")
async def health() -> Dict[str, Any]:
    return {
        "status": "ok",
        "firebase_initialized": is_firebase_initialized(),
        "firestore_initialized": is_firestore_available(),
    }
