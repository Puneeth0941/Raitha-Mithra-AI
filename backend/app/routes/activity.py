from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.activity import Activity
from app.models.user import User
from app.schemas.activity import ActivityCreate, ActivityResponse
from app.utils.security import get_current_user

router = APIRouter(
    prefix="/activity",
    tags=["Activity"]
)


from app.models.farm import Farm


@router.post("/add", response_model=ActivityResponse)
def add_activity(
    activity: ActivityCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Verify farm ownership
    farm = db.query(Farm).filter(Farm.id == activity.farm_id, Farm.user_id == current_user.id).first()
    if not farm:
        raise HTTPException(status_code=403, detail="Access denied: Farm does not belong to user")

    activity_data = activity.model_dump()
    activity_data["user_id"] = current_user.id
    new_activity = Activity(**activity_data)

    db.add(new_activity)
    db.commit()
    db.refresh(new_activity)

    return new_activity


@router.get("/all", response_model=list[ActivityResponse])
def get_all_activities(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    user_farm_ids = [f.id for f in db.query(Farm).filter(Farm.user_id == current_user.id).all()]
    return db.query(Activity).filter(
        (Activity.user_id == current_user.id) | (Activity.farm_id.in_(user_farm_ids))
    ).all()


@router.put("/update/{activity_id}", response_model=ActivityResponse)
def update_activity(
    activity_id: int,
    activity: ActivityCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    user_farm_ids = [f.id for f in db.query(Farm).filter(Farm.user_id == current_user.id).all()]
    existing_activity = db.query(Activity).filter(
        Activity.id == activity_id,
        (Activity.user_id == current_user.id) | (Activity.farm_id.in_(user_farm_ids))
    ).first()

    if not existing_activity:
        raise HTTPException(status_code=404, detail="Activity not found or access denied")

    for key, value in activity.model_dump().items():
        setattr(existing_activity, key, value)

    db.commit()
    db.refresh(existing_activity)

    return existing_activity


@router.delete("/delete/{activity_id}")
def delete_activity(
    activity_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    user_farm_ids = [f.id for f in db.query(Farm).filter(Farm.user_id == current_user.id).all()]
    activity = db.query(Activity).filter(
        Activity.id == activity_id,
        (Activity.user_id == current_user.id) | (Activity.farm_id.in_(user_farm_ids))
    ).first()

    if not activity:
        raise HTTPException(status_code=404, detail="Activity not found or access denied")

    db.delete(activity)
    db.commit()

    return {"message": "Activity deleted successfully"}