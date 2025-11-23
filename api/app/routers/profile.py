from enum import Enum

from fastapi import APIRouter, Depends, HTTPException, status

from app.core.firebase import SERVER_TIMESTAMP, get_firestore
from app.dependencies.auth import get_current_user_uid
from app.models.profile import UpdateProfileRequest, UpdateProfileResponse


router = APIRouter(prefix="/api", tags=["profile"])


@router.post(
    "/update-profile",
    response_model=UpdateProfileResponse,
    summary="Create or update the authenticated user's profile",
)
async def update_profile(
    payload: UpdateProfileRequest, uid: str = Depends(get_current_user_uid)
) -> UpdateProfileResponse:
    """Create or update the profile document for the authenticated user.

    - Auth: Firebase ID token (Bearer) required
    - Storage: Firestore at users/{uid}
    - Behavior: merge writes, server timestamp for updatedAt
    """

    db = get_firestore()
    if db is None:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Database not initialized")

    doc_ref = db.collection("users").document(uid)

    data = {
        "FullName": payload.FullName,
        "UsfEmail": payload.UsfEmail,
        "PreferredStudyTime": payload.PreferredStudyTime.value if isinstance(payload.PreferredStudyTime, Enum) else payload.PreferredStudyTime,
        "Classes": payload.Classes,
        # New fields
        "major": payload.major,
        "year": payload.year.value if isinstance(payload.year, Enum) else payload.year,
        "description": payload.description,
        "updatedAt": SERVER_TIMESTAMP,
    }

    try:
        doc_ref.set(data, merge=True)
    except Exception:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to write profile")

    return UpdateProfileResponse(status="success", uid=uid)
