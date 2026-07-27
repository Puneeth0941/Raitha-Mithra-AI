import os
import shutil
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import Optional

from app.database import get_db
from app.models.profile import Profile
from app.models.user import User
from app.schemas.profile import ProfileResponse, ProfileUpdate
from app.utils.security import get_current_user

router = APIRouter(
    prefix="/profile",
    tags=["Profile"]
)

UPLOAD_FOLDER = "uploads/profiles"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)


@router.get("/me", response_model=ProfileResponse)
def get_my_profile(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    if not profile:
        # Create default profile if none exists
        profile = Profile(
            user_id=current_user.id,
            name=current_user.name or "Farmer",
            phone=current_user.phone or "9845012345",
            village="Thirthahalli",
            profile_photo="",
            main_crop="Arecanut",
            farm_area="5"
        )
        db.add(profile)
        db.commit()
        db.refresh(profile)
    return profile


@router.put("/me", response_model=ProfileResponse)
def update_profile(
    payload: ProfileUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    if not profile:
        profile = Profile(
            user_id=current_user.id,
            name=payload.name,
            phone=payload.phone,
            village=payload.village,
            profile_photo=payload.profile_photo or "",
            main_crop=payload.main_crop or "Arecanut",
            farm_area=payload.farm_area or "5"
        )
        db.add(profile)
    else:
        profile.name = payload.name
        profile.phone = payload.phone
        profile.village = payload.village
        if payload.profile_photo is not None:
            profile.profile_photo = payload.profile_photo
        if payload.main_crop is not None:
            profile.main_crop = payload.main_crop
        if payload.farm_area is not None:
            profile.farm_area = payload.farm_area

    db.commit()
    db.refresh(profile)
    return profile


@router.post("/photo", response_model=dict)
def upload_profile_photo(
    photo: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    file_path = os.path.join(UPLOAD_FOLDER, photo.filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(photo.file, buffer)

    from fastapi import Request

@router.post("/photo")
def upload_profile_photo(
    request: Request,
    photo: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    ...
    return {
        "photo_url": f"{request.base_url}{file_path}"
    }

