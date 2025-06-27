from fastapi.routing import APIRouter
from fastapi import Depends
from fastapi.responses import JSONResponse
from utils.jwt import get_current_user
from models.expenses import Users, Budget
from schemas.BudgetSchema import createBudget, updateBudget
from db import engine
from sqlmodel import Session, select


router = APIRouter()


@router.post("/budget")
def create_budget(
    budgetData: createBudget, current_user: Users = Depends(get_current_user)
):
    new_budget = Budget(
        name_category=budgetData.name_category,
        value=budgetData.value,
        user_id=current_user.id,
    )

    with Session(engine) as session:
        session.add(new_budget)
        session.commit()
        session.refresh(new_budget)


@router.put("/budget/{id}")
def update_budget(
    id: int, budgetData: updateBudget, current_user: Users = Depends(get_current_user)
):
    with Session(engine) as session:
        statement = select(Budget).where(Budget.id == id)
        result = session.exec(statement).first()

        if budgetData.name_category is not None:
            result.name_category = budgetData.name_category
        if budgetData.value is not None:
            result.value = budgetData.value

        session.add(result)
        session.commit()
        session.refresh(result)


@router.post("/budget/{id}/delete")
def delete_budget(id: int, current_user: Users = Depends(get_current_user)):
    with Session(engine) as session:
        statement = select(Budget).where(Budget.id == id)
        result = session.exec(statement).first

        if result is None:
            return JSONResponse(
                status_code=404,
                content={"message": "Não foi encontrada esta categoria"},
            )

        session.delete(result)
        session.commit()
        session.refresh(result)


@router.get("/budget/categories")
def get_all_categories(current_user: Users = Depends(get_current_user)):
    with Session(engine) as session:
        statement = select(Budget.name_category).where(
            Budget.user_id == current_user.id
        ).distinct()

        results = session.exec(statement).all()
        return {"categories": results}
