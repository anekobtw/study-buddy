import json
from typing import Optional

import bcrypt
from fastapi import APIRouter, Header, HTTPException, status
from fastapi.security import HTTPBearer

import auth
import database
from models import SignInRequest, SignUpRequest, UpdateProfileRequest

router = APIRouter(prefix="/api", tags=["users"])
security = HTTPBearer()


@router.post("/signin")
def signin(request: SignInRequest):
    """Authenticate user and return JWT token."""
    user = database.get_user_by_email(request.email)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials"
        )

    if not bcrypt.checkpw(request.password.encode(), user["password"].encode()):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials"
        )

    token = auth.generate_jwt(request.email)
    user_data = {k: v for k, v in user.items() if k != "password"}

    return {"status": "success", "token": token, "user": user_data}


@router.post("/signup")
def signup(request: SignUpRequest):
    """Register a new user account."""
    if database.get_user_by_email(request.email):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered"
        )

    hashed_password = bcrypt.hashpw(
        request.password.encode(), bcrypt.gensalt()
    ).decode()

    try:
        database.create_user(
            usf_email=request.email,
            full_name=request.fullName,
            password=hashed_password,
            major=request.major,
            year=request.year,
            preferred_study_time=request.preferredStudyTime,
            classes=json.dumps(request.classes),
            description=request.description,
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

    token = auth.generate_jwt(request.email)
    user = database.get_user_by_email(request.email)
    user_data = {k: v for k, v in user.items() if k != "password"}

    return {"status": "success", "token": token, "user": user_data}


@router.post("/signout")
def signout():
    """Sign out user (client handles token removal)."""
    return {"status": "success"}


@router.get("/users/me")
def get_current_user(authorization: Optional[str] = Header(None)):
    """Get current authenticated user profile."""
    email = auth.get_current_user_email(authorization)
    user = database.get_user_by_email(email)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        )

    user_data = {k: v for k, v in user.items() if k != "password"}
    return user_data


@router.put("/users/me")
def update_current_user(
    request: UpdateProfileRequest, authorization: Optional[str] = Header(None)
):
    """Update current user profile."""
    email = auth.get_current_user_email(authorization)

    update_data = request.model_dump(exclude_unset=True)
    if update_data:
        database.update_user(email, **update_data)

    return {"status": "success"}


@router.delete("/users/me")
def delete_current_user(authorization: Optional[str] = Header(None)):
    email = auth.get_current_user_email(authorization)
    database.delete_user(email)
    return {"status": "success"}


@router.get("/users/{email}")
def get_user_by_email(email: str, authorization: Optional[str] = Header(None)):
    """Get a specific user's profile by email."""
    auth.get_current_user_email(authorization)

    user = database.get_user_by_email(email)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        )

    user_data = {k: v for k, v in user.items() if k != "password"}
    return user_data
