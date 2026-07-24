from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.farm import Farm
from app.models.user import User
from app.schemas.farm import FarmCreate, FarmResponse
from app.utils.security import get_current_user

router = APIRouter(
    prefix="/farm",
    tags=["Farm"]
)


@router.post("/add", response_model=FarmResponse)
def add_farm(
    farm: FarmCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    new_farm = Farm(
        user_id=current_user.id,
        farm_name=farm.farm_name,
        area=farm.area,
        total_acres=farm.total_acres,
        arecanut_trees=farm.arecanut_trees,
        coconut_trees=farm.coconut_trees
    )

    db.add(new_farm)
    db.commit()
    db.refresh(new_farm)

    return new_farm


@router.get("/all", response_model=list[FarmResponse])
def get_all_farms(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    farms = db.query(Farm).filter(Farm.user_id == current_user.id).all()
    return farms


@router.put("/update/{farm_id}", response_model=FarmResponse)
def update_farm(
    farm_id: int,
    farm: FarmCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    existing_farm = db.query(Farm).filter(
        Farm.id == farm_id,
        Farm.user_id == current_user.id
    ).first()

    if existing_farm is None:
        raise HTTPException(status_code=404, detail="Farm not found or access denied")

    existing_farm.farm_name = farm.farm_name
    existing_farm.area = farm.area
    existing_farm.total_acres = farm.total_acres
    existing_farm.arecanut_trees = farm.arecanut_trees
    existing_farm.coconut_trees = farm.coconut_trees

    db.commit()
    db.refresh(existing_farm)

    return existing_farm


@router.delete("/delete/{farm_id}")
def delete_farm(
    farm_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    farm = db.query(Farm).filter(
        Farm.id == farm_id,
        Farm.user_id == current_user.id
    ).first()

    if farm is None:
        raise HTTPException(
            status_code=404,
            detail="Farm not found or access denied"
        )

    db.delete(farm)
    db.commit()

    return {
        "message": "Farm deleted successfully"
    }