from typing import Dict, Literal, Optional

from pydantic import BaseModel


class SignUpRequest(BaseModel):
    email: str
    fullName: str
    year: Literal["Freshman", "Sophomore", "Junior", "Senior", "Graduate"]
    major: str
    preferredStudyTime: Literal[0, 1, 2, 3]
    classes: Dict[str, Literal[0, 1, 2]]
    description: str
    password: str


class SignInRequest(BaseModel):
    email: str
    password: str


class UpdateProfileRequest(BaseModel):
    fullName: Optional[str] = None
    year: Optional[Literal["Freshman", "Sophomore", "Junior", "Senior", "Graduate"]] = (
        None
    )
    major: Optional[str] = None
    preferredStudyTime: Optional[Literal[0, 1, 2, 3]] = None
    classes: Optional[Dict[str, Literal[0, 1, 2]]] = None
    description: Optional[str] = None


class User(BaseModel):
    uid: str
    fullName: str
    USFEmail: str
    major: str
    year: str
    preferredStudyTime: int
    classes: Dict[str, int]
    description: str


class SwipeRequest(BaseModel):
    targetUid: str
    direction: Literal["left", "right"]
