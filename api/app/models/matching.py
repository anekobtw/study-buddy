from enum import Enum
from typing import Dict, List, Literal, Optional

from pydantic import BaseModel, Field, field_validator


DirectionLiteral = Literal["left", "right"]
YearLiteral = Literal["freshman", "sophomore", "junior", "senior"]


class SubmitSwipeRequest(BaseModel):
    targetUid: str = Field(..., description="UID of the user being swiped")
    direction: DirectionLiteral = Field(..., description='Swipe direction: "left" | "right"')

    @field_validator("targetUid")
    @classmethod
    def target_uid_non_empty(cls, v: str) -> str:
        if not isinstance(v, str) or not v.strip():
            raise ValueError("targetUid must be a non-empty string")
        return v


class MatchModel(BaseModel):
    matchId: str
    userA: str
    userB: str


class NextBatchUser(BaseModel):
    uid: str
    fullName: str
    preferredStudyTime: str
    classes: Dict[str, int]
    # New fields exposed to clients
    major: str
    year: YearLiteral
    description: str


class NextBatchResponse(BaseModel):
    batch: List[NextBatchUser]


class SubmitSwipeResponse(BaseModel):
    match: Optional[MatchModel] = Field(default=None)


class MatchesResponse(BaseModel):
    matches: List[MatchModel]
