from fastapi import Depends, Query
from fastapi.routing import APIRouter
from fastapi.responses import JSONResponse
from utils.jwt import get_current_user
from schemas.ExpensesSchema import expense, updateExpense
from models.expenses import Expenses, Users
from db import engine
from sqlmodel import Session, select
from typing import Optional, List
from sqlalchemy import or_
from datetime import date

router = APIRouter()


@router.post("/expenses", response_model=dict)
def create_expense(
    expenseData: expense, current_user: Users = Depends(get_current_user)
):
    """
    Cria uma nova despesa para o usuário autenticado.
    """
    assert current_user.id is not None

    new_expense = Expenses(
        name=expenseData.name,
        description=expenseData.description,
        category=expenseData.category,
        value=expenseData.value,
        expense_date=expenseData.expense_date, # Usando a data enviada pelo usuário
        user_id=current_user.id,
    )

    with Session(engine) as session:
        session.add(new_expense)
        session.commit()
        session.refresh(new_expense)
        return {"message": "Despesa criada com sucesso"}


@router.get("/expenses", response_model=List[Expenses])
def list_expenses(
    start_date: Optional[date] = Query(None, description="Data de início do filtro (YYYY-MM-DD)"),
    end_date: Optional[date] = Query(None, description="Data de fim do filtro (YYYY-MM-DD)"),
    category: Optional[str] = Query(None, description="Filtrar por categoria"),
    search: Optional[str] = Query(None, description="Buscar por nome ou descrição"),
    current_user: Users = Depends(get_current_user),
):
    """
    Lista as despesas do usuário autenticado com filtros opcionais.
    """
    with Session(engine) as session:
        statement = select(Expenses).where(Expenses.user_id == current_user.id)

        if start_date:
            statement = statement.where(Expenses.expense_date >= start_date) # Filtrando por expense_date

        if end_date:
            statement = statement.where(Expenses.expense_date <= end_date) # Filtrando por expense_date

        if category and category != "Todas":
            statement = statement.where(Expenses.category == category)

        if search:
            statement = statement.where(
                or_(
                    Expenses.name.ilike(f"%{search}%"),
                    Expenses.description.ilike(f"%{search}%"),
                )
            )

        statement = statement.order_by(Expenses.expense_date.desc()) # Ordenando por expense_date

        results = session.exec(statement).all()
        return results


@router.post("/expense/{id}/delete", response_model=dict)
def delete_expense(id: int, current_user: Users = Depends(get_current_user)):
    """
    Deleta uma despesa específica do usuário.
    """
    with Session(engine) as session:
        expense_to_delete = session.get(Expenses, id)

        if not expense_to_delete:
            return JSONResponse(status_code=404, content={"message": "Despesa não encontrada"})

        if expense_to_delete.user_id != current_user.id:
            return JSONResponse(status_code=403, content={"message": "Acesso negado"})

        session.delete(expense_to_delete)
        session.commit()

        return {"message": f"Despesa '{expense_to_delete.name}' excluída com sucesso"}


@router.put("/expense/{id}", response_model=dict)
def modify_expense(
    id: int, expenseData: updateExpense, current_user: Users = Depends(get_current_user)
):
    """
    Modifica uma despesa existente.
    """
    with Session(engine) as session:
        expense_to_update = session.get(Expenses, id)

        if not expense_to_update:
            return JSONResponse(status_code=404, content={"message": "Despesa não encontrada"})

        if expense_to_update.user_id != current_user.id:
            return JSONResponse(status_code=403, content={"message": "Acesso negado"})

        update_data = expenseData.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(expense_to_update, key, value)

        session.add(expense_to_update)
        session.commit()
        session.refresh(expense_to_update)

        return {"message": f"Despesa '{expense_to_update.name}' alterada com sucesso"}