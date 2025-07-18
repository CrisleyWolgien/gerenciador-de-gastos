from fastapi import Depends, APIRouter, Query
from sqlmodel import Session, select, func
from models.expenses import Expenses, Users, Budget
from db import engine
from utils.jwt import get_current_user
from datetime import date, timedelta
from typing import Optional

router = APIRouter()

@router.get("/dashboard/overview_by_date")
def get_dashboard_overview_by_date(
    current_user: Users = Depends(get_current_user),
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
):
    """
    Fornece um overview completo para o dashboard, filtrado por um intervalo de datas.
    """
    with Session(engine) as session:
        # Define o mês atual como padrão
        if not start_date or not end_date:
            today = date.today()
            start_date = today.replace(day=1)
            next_month = start_date.replace(day=28) + timedelta(days=4)
            end_date = next_month - timedelta(days=next_month.day)

        # Query base para despesas no período
        expense_query_base = select(Expenses).where(
            Expenses.user_id == current_user.id,
            Expenses.expense_date >= start_date,
            Expenses.expense_date <= end_date,
        )

        # --- 1. Cards de Resumo ---
        total_spent = session.exec(expense_query_base.with_only_columns(func.sum(Expenses.value))).one_or_none() or 0
        total_budget = session.exec(select(func.sum(Budget.value)).where(Budget.user_id == current_user.id)).one_or_none() or 0

        # Categoria com maior gasto
        top_category_query = (
            select(Expenses.category)
            .where(
                Expenses.user_id == current_user.id,
                Expenses.expense_date >= start_date,
                Expenses.expense_date <= end_date,
            )
            .group_by(Expenses.category)
            .order_by(func.sum(Expenses.value).desc())
        )
        top_category = session.exec(top_category_query).first() or "N/A"

        # --- 2. Gráfico de Barras (Gastos Diários) ---
        daily_spending = session.exec(
            select(
                Expenses.expense_date.label("date"),
                func.sum(Expenses.value).label("value")
            )
            .where(
                Expenses.user_id == current_user.id,
                Expenses.expense_date >= start_date,
                Expenses.expense_date <= end_date,
            )
            .group_by(Expenses.expense_date)
            .order_by(Expenses.expense_date)
        ).all()

        # --- 3. Gráfico de Pizza (Distribuição) ---
        category_distribution = session.exec(
            select(
                Expenses.category.label("name"),
                func.sum(Expenses.value).label("value")
            )
            .where(
                Expenses.user_id == current_user.id,
                Expenses.expense_date >= start_date,
                Expenses.expense_date <= end_date,
            )
            .group_by(Expenses.category)
        ).all()

        # --- 4. Cards de Orçamento por Categoria ---
        user_budgets_query = select(Budget.name_category, Budget.value).where(Budget.user_id == current_user.id)
        budget_map = {b.name_category: b.value for b in session.exec(user_budgets_query).all()}

        # ========================================================================
        # CORREÇÃO APLICADA AQUI
        # ========================================================================
        category_spending_query = (
            select(
                Expenses.category,  # Seleciona a coluna da categoria
                func.sum(Expenses.value).label("total") # E a soma com um rótulo 'total'
            )
            .where(
                Expenses.user_id == current_user.id,
                Expenses.expense_date >= start_date,
                Expenses.expense_date <= end_date,
            )
            .group_by(Expenses.category)
        )
        # O resultado agora é uma lista de objetos Row, onde podemos acessar .category e .total
        category_spending_results = session.exec(category_spending_query).all()
        category_spending = {r.category: r.total for r in category_spending_results}
        # ========================================================================

        category_budgets_overview = []
        for category_name, budget_value in budget_map.items():
            spent_value = category_spending.get(category_name, 0)
            category_budgets_overview.append({
                "category": category_name,
                "spent": spent_value,
                "budget": budget_value,
            })

        return {
            "total_spent": total_spent,
            "total_budget": total_budget,
            "top_category": top_category,
            "daily_spending": daily_spending,
            "category_distribution": category_distribution,
            "category_budgets": category_budgets_overview,
        }