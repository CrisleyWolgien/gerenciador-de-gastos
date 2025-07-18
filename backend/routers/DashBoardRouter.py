from fastapi import Depends, APIRouter, Query
from sqlmodel import Session, select, func
from models.expenses import Expenses, Users, Budget
from db import engine
from utils.jwt import get_current_user
from datetime import date
from typing import Optional, List

router = APIRouter()


@router.get("/dashboard/stats")
def get_dashboard_stats(
    current_user: Users = Depends(get_current_user),
    start_date: Optional[date] = Query(None, description="Data de início do filtro (YYYY-MM-DD)"),
    end_date: Optional[date] = Query(None, description="Data de fim do filtro (YYYY-MM-DD)"),
):
    """
    Fornece estatísticas do dashboard para um determinado período.
    """
    with Session(engine) as session:
        expense_query = select(Expenses).where(Expenses.user_id == current_user.id)

        if start_date:
            expense_query = expense_query.where(Expenses.expense_date >= start_date)
        if end_date:
            expense_query = expense_query.where(Expenses.expense_date <= end_date)
        
        total_spent = session.exec(expense_query.with_only_columns(func.sum(Expenses.value))).one_or_none() or 0
        total_transactions = session.exec(expense_query.with_only_columns(func.count(Expenses.id))).one()

        budget_query = select(func.sum(Budget.value)).where(Budget.user_id == current_user.id)
        total_budget = session.exec(budget_query).one_or_none() or 0

        return {
            "total_spent": total_spent,
            "total_budget": total_budget, # Orçamento total não é filtrado por data
            "total_transactions": total_transactions,
        }


@router.get("/dashboard/expenses_by_category")
def get_expenses_by_category(
    current_user: Users = Depends(get_current_user),
    start_date: Optional[date] = Query(None, description="Data de início do filtro (YYYY-MM-DD)"),
    end_date: Optional[date] = Query(None, description="Data de fim do filtro (YYYY-MM-DD)"),
):
    """
    Fornece um resumo dos gastos por categoria para um determinado período.
    """
    with Session(engine) as session:
        query = (
            select(
                Expenses.category,
                func.sum(Expenses.value).label("total"),
                func.count(Expenses.id).label("count"),
            )
            .where(Expenses.user_id == current_user.id)
            .group_by(Expenses.category)
            .order_by(func.sum(Expenses.value).desc())
        )

        if start_date:
            query = query.where(Expenses.expense_date >= start_date)
        if end_date:
            query = query.where(Expenses.expense_date <= end_date)

        results = session.exec(query).all()
        
        budget_query = select(Budget.name_category, Budget.value).where(Budget.user_id == current_user.id)
        budgets = {b.name_category: b.value for b in session.exec(budget_query).all()}

        response_data = [
            {
                "category": r.category,
                "total": r.total,
                "count": r.count,
                "budget": budgets.get(r.category, 0),
            }
            for r in results
        ]

        return response_data

# NOVA ROTA PARA O GRÁFICO DE GASTOS DIÁRIOS
@router.get("/dashboard/spending_over_time")
def get_spending_over_time(
    current_user: Users = Depends(get_current_user),
    start_date: Optional[date] = Query(..., description="Data de início do filtro (YYYY-MM-DD)"),
    end_date: Optional[date] = Query(..., description="Data de fim do filtro (YYYY-MM-DD)"),
):
    """
    Agrega os gastos por dia dentro de um intervalo de datas.
    """
    with Session(engine) as session:
        query = (
            select(
                Expenses.expense_date,
                func.sum(Expenses.value).label("total_spent")
            )
            .where(Expenses.user_id == current_user.id)
            .where(Expenses.expense_date >= start_date)
            .where(Expenses.expense_date <= end_date)
            .group_by(Expenses.expense_date)
            .order_by(Expenses.expense_date)
        )
        
        results = session.exec(query).all()
        return [{"date": r.expense_date, "total": r.total_spent} for r in results]