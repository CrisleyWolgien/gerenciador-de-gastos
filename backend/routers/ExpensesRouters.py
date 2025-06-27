from fastapi import Depends
from fastapi.routing import APIRouter
from fastapi.responses import JSONResponse
from utils.jwt import get_current_user
from schemas.ExpensesSchema import expense
from models.expenses import Expenses, Users
from db import engine
from sqlmodel import Session, select
from typing import Optional
from sqlalchemy import or_


router = APIRouter()


@router.post("/expenses")
def create_expense(
    expenseData: expense, current_user: Users = Depends(get_current_user)
):
    assert current_user.id is not None
    new_expense = Expenses(
        name=expenseData.name,
        description=expenseData.description,
        category=expenseData.category,
        value=expenseData.value,
        user_id=current_user.id,
    )

    with Session(engine) as session:
        session.add(new_expense)
        session.commit()
        session.refresh(new_expense)
        return {"message": "Despesa Criada com sucesso"}


@router.get("/expenses")
def list_expenses(
    category: Optional[str] = None,
    search: Optional[str] = None,
    min_value: Optional[float] = None,
    max_value: Optional[float] = None,
    current_user: Users = Depends(get_current_user),
):
    with Session(engine) as session:
        statement = select(Expenses).where(Expenses.user_id == current_user.id)

        if category:
            statement = statement.where(Expenses.category == category)

        if search:
            statement = statement.where(
                or_(
                    Expenses.name.contains(search),  # type: ignore
                    Expenses.description.contains(search),  # type: ignore
                )
            )

        if min_value is not None:
            statement = statement.where(Expenses.value >= min_value)

        if max_value:
            statement = statement.where(Expenses.value <= max_value)

        results = session.exec(statement).all()

        return results


@router.post("/expense/{id}/delete")
def delete_expense(id: int, current_user: Users = Depends(get_current_user)):
    with Session(engine) as session:
        statement = select(Expenses).where(Expenses.id == id)
        result = session.exec(statement).first()

        if not result:
            return JSONResponse(
                status_code=404, content={"message": "Despesa não encontrada"}
            )
        if result.user_id != current_user.id:
            return JSONResponse(status_code=403, content={"message": "Acesso negado"})

        session.delete(result)
        session.commit()

        return {"message": f"despesa excluida com sucesso {result.name}"}


@router.put("/expense/{id}")
def modify_expense(
    id: int, expenseData: expense, current_user: Users = Depends(get_current_user)
):
    with Session(engine) as session:
        statement = select(Expenses).where(Expenses.id == id)
        result = session.exec(statement).first()

        if not result:
            return JSONResponse(
                status_code=404, content={"message": "Despesa não encontrada"}
            )
        if result.user_id != current_user.id:
            return JSONResponse(status_code=403, content={"message": "Acesso negado"})

        if expenseData.name is not None:
            result.name = expenseData.name
        if expenseData.description is not None:
            result.description = expenseData.description
        if expenseData.value is not None:
            result.value = expenseData.value
        if expenseData.category is not None:
            result.category = expenseData.category

        session.add(result)
        session.commit()
        session.refresh(result)

        return {"message": f"Despesa {result.name} alterada com sucesso"}
