from fastapi.routing import APIRouter
from fastapi.responses import JSONResponse
from schemas.ExpensesSchema import expense
from models.expenses import Expenses
from db import engine
from sqlmodel import Session, select


router = APIRouter()


@router.post("/expenses")
def create_expense(expenseData: expense):
    new_expense = Expenses(
        name=expenseData.name,
        description=expenseData.description,
        value=expenseData.value,
    )

    with Session(engine) as session:
        session.add(new_expense)
        session.commit()
        session.refresh(new_expense)
        return {"message": "Despesa Criada com sucesso"}


@router.get("/expense")
def list_expenses():
    with Session(engine) as session:
        statement = select(Expenses)
        results = session.exec(statement).all()

        return results


@router.post("/expense/{id}/delete")
def delete_expense(id: int):
    with Session(engine) as session:
        statement = select(Expenses).where(Expenses.id == id)
        result = session.exec(statement).first()

        session.delete(result)
        session.commit()

        return {"message": f"despesa excluida com sucesso {result.name}"}


@router.put("/expense/{id}")
def modify_expense(id: int, expenseData: expense):
    with Session(engine) as session:
        statement = select(Expenses).where(Expenses.id == id)
        result = session.exec(statement).first()

        if not result:
            return JSONResponse(
                status_code=404, content={"message": "Despesa não encontrada"}
            )

        if expenseData.name is not None:
            result.name = expenseData.name
        if expenseData.description is not None:
            result.description = expenseData.description
        if expenseData.value is not None:
            result.value = expenseData.value

        session.add(result)
        session.commit()
        session.refresh(result)

        return {"message": f"Despesa {result.name} alterada com sucesso"}
