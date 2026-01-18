from pydantic import BaseModel, Field, field_validator
from typing import Optional
from datetime import date

class EnrolmentRecord(BaseModel):
    """
    Strict validation schema for Enrolment CSV records.
    """
    state: str = Field(..., min_length=2)
    district: str = Field(..., min_length=2)
    pincode: Optional[int] = Field(None, ge=100000, le=999999)
    gender: str = Field(..., pattern="^(M|F|T)$")
    age_group: str = Field(..., pattern="^(0-5|5-18|18\+|Total)$")
    aadhaar_generated: int = Field(..., ge=0)
    enrolment_rejected: int = Field(..., ge=0)
    email_updates: int = Field(0, ge=0)
    mobile_updates: int = Field(0, ge=0)

    @field_validator('state', 'district')
    @classmethod
    def clean_strings(cls, v):
        return v.strip().title()

class DemographicUpdateRecord(BaseModel):
    """
    Strict validation schema for Demographic Update CSV records.
    """
    date: date
    state: str
    district: str
    sub_district: Optional[str] = None
    update_type: str = Field(..., pattern="^(Address|Name|DOB|Gender|Mobile|Email)$")
    attempt_count: int = Field(..., ge=0)
    success_count: int = Field(..., ge=0)
    
class BiometricUpdateRecord(BaseModel):
    """
    Strict validation schema for Biometric Update CSV records.
    """
    date: date
    state: str
    district: str
    center_id: str
    iris_updates: int = Field(0, ge=0)
    fingerprint_updates: int = Field(0, ge=0)
    photo_updates: int = Field(0, ge=0)
