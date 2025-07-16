from fastapi.routing import APIRouter
from fastapi import Depends
from fastapi.responses import JSONResponse
from utils.jwt import get_current_user
from models.expenses import Users, Budget
from schemas.BudgetSchema import createBudget, updateBudget
from db import engine
from sqlmodel import Session, select
from typing import List

router = APIRouter()


@router.post("/budget", response_model=dict)
def create_budget(
    budgetData: createBudget, current_user: Users = Depends(get_current_user)
):
    """
    Cria uma nova categoria de orçamento para o usuário.
    """
    new_budget = Budget(
        name_category=budgetData.name_category,
        value=budgetData.value,
        user_id=current_user.id,
    )

    with Session(engine) as session:
        session.add(new_budget)
        session.commit()
        session.refresh(new_budget)
        return {"message": "Orçamento criado com sucesso!"}


# ========================================================================
# ROTA QUE FALTAVA: GET /budgets
# ========================================================================
@router.get("/budgets", response_model=List[Budget])
def get_all_budgets(current_user: Users = Depends(get_current_user)):
    """
    Retorna todos os orçamentos criados pelo usuário autenticado.
    """
    with Session(engine) as session:
        statement = select(Budget).where(Budget.user_id == current_user.id)
        results = session.exec(statement).all()
        return results


@router.put("/budget/{id}", response_model=dict)
def update_budget(
    id: int, budgetData: updateBudget, current_user: Users = Depends(get_current_user)
):
    """
    Atualiza um orçamento existente.
    """
    with Session(engine) as session:
        result = session.get(Budget, id)
        
        if not result:
            return JSONResponse(status_code=404, content={"message": "Orçamento não encontrado"})
        
        if result.user_id != current_user.id:
            return JSONResponse(status_code=403, content={"message": "Acesso negado"})

        if budgetData.name_category is not None:
            result.name_category = budgetData.name_category
        if budgetData.value is not None:
            result.value = budgetData.value

        session.add(result)
        session.commit()
        session.refresh(result)
        return {"message": "Orçamento atualizado com sucesso!"}


@router.post("/budget/{id}/delete", response_model=dict)
def delete_budget(id: int, current_user: Users = Depends(get_current_user)):
    """
    Deleta um orçamento específico.
    """
    with Session(engine) as session:
        result = session.get(Budget, id)

        if not result:
            return JSONResponse(status_code=404, content={"message": "Orçamento não encontrado"})
        
        if result.user_id != current_user.id:
            return JSONResponse(status_code=403, content={"message": "Acesso negado"})

        session.delete(result)
        session.commit()
        return {"message": "Orçamento deletado com sucesso!"}


@router.get("/budget/categories", response_model=dict)
def get_all_categories(current_user: Users = Depends(get_current_user)):
    """
    Retorna uma lista com os nomes de todas as categorias de orçamento do usuário.
    """
    with Session(engine) as session:
        statement = select(Budget.name_category).where(
            Budget.user_id == current_user.id
        ).distinct()

        results = session.exec(statement).all()
        return {"categories": results}
