from typing import Dict, Literal, Optional

from pydantic import BaseModel


class SignUpRequest(BaseModel):
    email: str
    fullName: str
    year: Literal["Freshman", "Sophomore", "Junior", "Senior", "Graduate"]
    major: str
    preferredStudyTime: int
    classes: Dict[str, int]
    description: str
    password: str
    profilePicture: Optional[str] = None


class SignInRequest(BaseModel):
    email: str
    password: str


class UpdateProfileRequest(BaseModel):
    fullName: Optional[str] = None
    year: Optional[Literal["Freshman", "Sophomore", "Junior", "Senior", "Graduate"]] = (
        None
    )
    major: Optional[str] = None
    preferredStudyTime: Optional[int] = None
    classes: Optional[Dict[str, int]] = None
    description: Optional[str] = None
    profilePicture: Optional[str] = None


class User(BaseModel):
    uid: str
    fullName: str
    USFEmail: str
    major: str
    year: str
    preferredStudyTime: int
    classes: Dict[str, int]
    description: str
    profilePicture: Optional[str] = None


class SwipeRequest(BaseModel):
    targetUid: str
    direction: Literal["left", "right"]
