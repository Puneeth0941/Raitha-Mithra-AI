from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.expense import Expense
from app.models.user import User
from app.schemas.expense import ExpenseCreate, ExpenseResponse
from app.utils.security import get_current_user

router = APIRouter(
    prefix="/expense",
    tags=["Expense"]
)


from app.models.farm import Farm


# Add Expense
@router.post("/add", response_model=ExpenseResponse)
def add_expense(
    expense: ExpenseCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Verify farm ownership
    farm = db.query(Farm).filter(Farm.id == expense.farm_id, Farm.user_id == current_user.id).first()
    if not farm:
        raise HTTPException(status_code=403, detail="Access denied: Farm does not belong to user")

    expense_data = expense.model_dump()
    expense_data["user_id"] = current_user.id
    new_expense = Expense(**expense_data)

    db.add(new_expense)
    db.commit()
    db.refresh(new_expense)

    return new_expense


# Get All Expenses
@router.get("/all", response_model=list[ExpenseResponse])
def get_all_expenses(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    user_farm_ids = [f.id for f in db.query(Farm).filter(Farm.user_id == current_user.id).all()]
    return db.query(Expense).filter(
        (Expense.user_id == current_user.id) | (Expense.farm_id.in_(user_farm_ids))
    ).all()


# Update Expense
@router.put("/update/{expense_id}", response_model=ExpenseResponse)
def update_expense(
    expense_id: int,
    expense: ExpenseCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    user_farm_ids = [f.id for f in db.query(Farm).filter(Farm.user_id == current_user.id).all()]
    existing_expense = db.query(Expense).filter(
        Expense.id == expense_id,
        (Expense.user_id == current_user.id) | (Expense.farm_id.in_(user_farm_ids))
    ).first()

    if not existing_expense:
        raise HTTPException(status_code=404, detail="Expense not found or access denied")

    for key, value in expense.model_dump().items():
        setattr(existing_expense, key, value)

    db.commit()
    db.refresh(existing_expense)

    return existing_expense


# Delete Expense
@router.delete("/delete/{expense_id}")
def delete_expense(
    expense_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    user_farm_ids = [f.id for f in db.query(Farm).filter(Farm.user_id == current_user.id).all()]
    expense = db.query(Expense).filter(
        Expense.id == expense_id,
        (Expense.user_id == current_user.id) | (Expense.farm_id.in_(user_farm_ids))
    ).first()

    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found or access denied")

    db.delete(expense)
    db.commit()

    return {"message": "Expense deleted successfully"}