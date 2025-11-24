from datetime import datetime, timedelta
from typing import Optional

import jwt
from fastapi import Header, HTTPException, status

SECRET_KEY = "your-secret-key-change-this-in-production"
ALGORITHM = "HS256"


def generate_jwt(email: str):
    data = {
        "sub": email,
        "exp": datetime.utcnow() + timedelta(days=7),
        "iat": datetime.utcnow(),
    }

    return jwt.encode(data, SECRET_KEY, algorithm=ALGORITHM)


def decode_jwt(encoded: str):
    return jwt.decode(encoded, SECRET_KEY, algorithms=[ALGORITHM])


def get_current_user_email(authorization: Optional[str] = Header(None)) -> str:
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing authorization header",
        )

    try:
        token = authorization.split()[1]
        payload = decode_jwt(token)
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
