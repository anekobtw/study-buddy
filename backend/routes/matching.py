import random
from typing import Optional

from fastapi import APIRouter, Header, HTTPException, status

import auth
import database
from models import SwipeRequest

router = APIRouter(prefix="/api", tags=["matching"])


def get_current_user_email(authorization: Optional[str] = Header(None)) -> str:
    """Extract and validate user email from JWT token."""
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing authorization header",
        )

    try:
        token = authorization.split()[1]
        payload = auth.decode_jwt(token)
        email = payload.get("sub")

        if not email:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token"
            )

        return email
    except (IndexError, Exception):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authorization header",
        )


@router.get("/next_batch")
def get_next_batch(authorization: Optional[str] = Header(None)):
    """Get a batch of users to swipe on."""
    email = get_current_user_email(authorization)

    swiped = database.get_swiped_uids(email)
    available = [
        u for u in database.get_all_users_except(email) if u["usf_email"] not in swiped
    ]

    batch = random.sample(available, min(10, len(available)))
    return {"batch": batch}


@router.post("/submit_swipe")
def submit_swipe(request: SwipeRequest, authorization: Optional[str] = Header(None)):
    """Submit a left or right swipe on another user."""
    email = get_current_user_email(authorization)

    database.create_swipe(email, request.targetUid, request.direction)

    is_mutual = False
    if request.direction == "right":
        is_mutual = database.check_mutual_swipe(email, request.targetUid)

    return {"isMutualMatch": is_mutual}
