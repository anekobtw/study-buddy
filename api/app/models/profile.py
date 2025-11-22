from enum import Enum
from typing import Dict

from pydantic import BaseModel, Field, field_validator


class PreferredStudyTimeEnum(str, Enum):
    morning = "morning"
    afternoon = "afternoon"
    evening = "evening"
    night = "night"


class YearEnum(str, Enum):
    freshman = "freshman"
    sophomore = "sophomore"
    junior = "junior"
    senior = "senior"


class UpdateProfileRequest(BaseModel):
    FullName: str = Field(..., description="User's full name")
    UsfEmail: str = Field(..., description="USF email address")
    PreferredStudyTime: PreferredStudyTimeEnum = Field(..., description="Preferred time of day for studying")
    Classes: Dict[str, int] = Field(
        default_factory=dict,
        description="Mapping of class name to proficiency level (0=bad, 1=okay, 2=good)",
        examples=[{"Calculus": 2, "Chemistry": 0}],
    )

    # New fields
    major: str = Field(..., min_length=1, description="User's major, non-empty string")
    year: YearEnum = Field(..., description='Academic year: "freshman"|"sophomore"|"junior"|"senior"')
    description: str = Field(..., min_length=1, max_length=1000, description="Short bio/description")

    @field_validator("FullName")
    @classmethod
    def name_non_empty(cls, v: str) -> str:
        if not isinstance(v, str) or not v.strip():
            raise ValueError("FullName must be a non-empty string")
        return v

    @field_validator("UsfEmail")
    @classmethod
    def email_is_string(cls, v: str) -> str:
        if not isinstance(v, str) or not v.strip():
            raise ValueError("UsfEmail must be a non-empty string")
        v_str = v.strip()
        if not v_str.lower().endswith("@usf.edu"):
            raise ValueError("UsfEmail must end with @usf.edu")
        return v_str

    @field_validator("Classes")
    @classmethod
    def classes_levels_valid(cls, v: Dict[str, int]) -> Dict[str, int]:
        allowed = {0, 1, 2}
        for key, val in v.items():
            if not isinstance(key, str) or not key:
                raise ValueError("Class names must be non-empty strings")
            if not isinstance(val, int) or val not in allowed:
                raise ValueError("Each class level must be an integer 0, 1, or 2")
        return v

    @field_validator("major")
    @classmethod
    def major_non_empty(cls, v: str) -> str:
        if not isinstance(v, str) or not v.strip():
            raise ValueError("major must be a non-empty string")
        return v.strip()

    @field_validator("description")
    @classmethod
    def description_non_empty(cls, v: str) -> str:
        if not isinstance(v, str) or not v.strip():
            raise ValueError("description must be a non-empty string")
        return v.strip()


class UpdateProfileResponse(BaseModel):
    status: str = Field("success", description="Operation status")
    uid: str = Field(..., description="Firebase user UID")
