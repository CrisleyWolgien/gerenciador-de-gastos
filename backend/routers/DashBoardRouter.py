from fastapi.routing import APIRouter
from fastapi import Depends
from datetime import date

from utils.jwt import get_current_user
from models.expenses import Expenses, Users, Budget
from db import engine
from sqlmodel import Session, select
from sqlalchemy import func

router = APIRouter()


@router.get("/dashboard/totalSpent")
def Dasboard_total_spent(current_user: Users = Depends(get_current_user)):
    with Session(engine) as session:
        statement = select(func.sum(Expenses.value)).where(
            Expenses.user_id == current_user.id
        )
        results = session.exec(statement).all()

        return {"total_spent": results[0] or 0}

@router.get("/dashboard/totalspent/time")
def dashboard_total_spent_time(start_date: date, final_date: date, current_user: Users = Depends(get_current_user)):
    with Session(engine) as session:
        statement = select(func.sum(Expenses.value)).where(
            Expenses.user_id == current_user.id,
            Expenses.date >= start_date,
            Expenses.date <= final_date
        )

        result = session.exec(statement).one_or_none() or (0,)
        return {
            "start_date": start_date,
            "final_date": final_date,
            "total_spent": result[0] or 0
        }



@router.get("/dashboard/categorySpent")
def dashboard_category_spent(
    category: str, current_user: Users = Depends(get_current_user)
):
    with Session(engine) as session:
        statement = select(func.sum(Expenses.value)).where(
            Expenses.category == category, Expenses.user_id == current_user.id
        )
        results = session.exec(statement).one_or_none() or (0,)
        return {"total_spent": results}


@router.get("/dashboard/remaining")
def dashboard_category_remaining(
    category: str, current_user: Users = Depends(get_current_user)
):
    with Session(engine) as session:
        statement_budget = select(Budget).where(
            Budget.name_category == category, Budget.user_id == current_user.id
        )
        results_budget = session.exec(statement_budget).first()

        statement_category = select(func.sum(Expenses.value)).where(
            Expenses.category == category, Expenses.user_id == current_user.id
        )

        results_category = session.exec(statement_category).one_or_none() or (0,)

        return {"budget": results_budget.value, "category": results_category}


