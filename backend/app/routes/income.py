from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.income import Income
from app.models.user import User
from app.schemas.income import IncomeCreate, IncomeResponse
from app.utils.security import get_current_user

router = APIRouter(
    prefix="/income",
    tags=["Income"]
)


from app.models.farm import Farm


@router.post("/add", response_model=IncomeResponse)
def add_income(
    income: IncomeCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Verify farm ownership
    farm = db.query(Farm).filter(Farm.id == income.farm_id, Farm.user_id == current_user.id).first()
    if not farm:
        raise HTTPException(status_code=403, detail="Access denied: Farm does not belong to user")

    income_data = income.model_dump()
    income_data["user_id"] = current_user.id
    new_income = Income(**income_data)

    db.add(new_income)
    db.commit()
    db.refresh(new_income)

    return new_income


@router.get("/all", response_model=list[IncomeResponse])
def get_all_income(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    user_farm_ids = [f.id for f in db.query(Farm).filter(Farm.user_id == current_user.id).all()]
    return db.query(Income).filter(
        (Income.user_id == current_user.id) | (Income.farm_id.in_(user_farm_ids))
    ).all()


@router.put("/update/{income_id}", response_model=IncomeResponse)
def update_income(
    income_id: int,
    income: IncomeCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    user_farm_ids = [f.id for f in db.query(Farm).filter(Farm.user_id == current_user.id).all()]
    existing_income = db.query(Income).filter(
        Income.id == income_id,
        (Income.user_id == current_user.id) | (Income.farm_id.in_(user_farm_ids))
    ).first()

    if not existing_income:
        raise HTTPException(status_code=404, detail="Income not found or access denied")

    for key, value in income.model_dump().items():
        setattr(existing_income, key, value)

    db.commit()
    db.refresh(existing_income)

    return existing_income


@router.delete("/delete/{income_id}")
def delete_income(
    income_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    user_farm_ids = [f.id for f in db.query(Farm).filter(Farm.user_id == current_user.id).all()]
    income = db.query(Income).filter(
        Income.id == income_id,
        (Income.user_id == current_user.id) | (Income.farm_id.in_(user_farm_ids))
    ).first()

    if not income:
        raise HTTPException(status_code=404, detail="Income not found or access denied")

    db.delete(income)
    db.commit()

    return {"message": "Income deleted successfully"}