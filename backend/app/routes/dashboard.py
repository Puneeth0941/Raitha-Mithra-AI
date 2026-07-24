from decimal import Decimal
from typing import Optional

from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.farm import Farm
from app.models.expense import Expense
from app.models.income import Income
from app.models.user import User
from app.schemas.dashboard import DashboardResponse
from app.utils.security import get_current_user

router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"]
)


@router.get("/", response_model=DashboardResponse)
def get_dashboard(
    farm_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    user_farms = db.query(Farm).filter(Farm.user_id == current_user.id).all()
    user_farm_ids = [f.id for f in user_farms]

    total_farms = len(user_farms)

    if farm_id is not None:
        # Validate target farm belongs to user
        if farm_id not in user_farm_ids:
            return DashboardResponse(
                total_farms=0,
                total_income=Decimal("0.0"),
                total_expense=Decimal("0.0"),
                net_profit=Decimal("0.0"),
                total_arecanut_trees=0,
                total_coconut_trees=0
            )
        income_query = db.query(func.coalesce(func.sum(Income.amount), 0)).filter(
            Income.farm_id == farm_id,
            (Income.user_id == current_user.id) | (Income.farm_id.in_(user_farm_ids))
        )
        expense_query = db.query(func.coalesce(func.sum(Expense.amount), 0)).filter(
            Expense.farm_id == farm_id,
            (Expense.user_id == current_user.id) | (Expense.farm_id.in_(user_farm_ids))
        )
        arecanut_query = db.query(func.coalesce(func.sum(Farm.arecanut_trees), 0)).filter(
            Farm.id == farm_id, Farm.user_id == current_user.id
        )
        coconut_query = db.query(func.coalesce(func.sum(Farm.coconut_trees), 0)).filter(
            Farm.id == farm_id, Farm.user_id == current_user.id
        )
    else:
        income_query = db.query(func.coalesce(func.sum(Income.amount), 0)).filter(
            (Income.user_id == current_user.id) | (Income.farm_id.in_(user_farm_ids))
        )
        expense_query = db.query(func.coalesce(func.sum(Expense.amount), 0)).filter(
            (Expense.user_id == current_user.id) | (Expense.farm_id.in_(user_farm_ids))
        )
        arecanut_query = db.query(func.coalesce(func.sum(Farm.arecanut_trees), 0)).filter(
            Farm.user_id == current_user.id
        )
        coconut_query = db.query(func.coalesce(func.sum(Farm.coconut_trees), 0)).filter(
            Farm.user_id == current_user.id
        )

    total_income = income_query.scalar()
    total_expense = expense_query.scalar()

    total_arecanut = arecanut_query.scalar()
    total_coconut = coconut_query.scalar()

    net_profit = Decimal(str(total_income)) - Decimal(str(total_expense))

    return DashboardResponse(
        total_farms=total_farms,
        total_income=total_income,
        total_expense=total_expense,
        net_profit=net_profit,
        total_arecanut_trees=total_arecanut,
        total_coconut_trees=total_coconut
    )