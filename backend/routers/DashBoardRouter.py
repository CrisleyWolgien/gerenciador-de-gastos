from fastapi import Depends, APIRouter, Query
from sqlmodel import Session, select, func
from models.expenses import Expenses, Users, Budget
from db import engine
from utils.jwt import get_current_user
from datetime import date, timedelta
from typing import Optional

router = APIRouter()

@router.get("/dashboard/overview_by_date")
def get_dashboard_overview_by_date( # Renomeei para ser mais claro
    current_user: Users = Depends(get_current_user),
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
):
    """
    Fornece um overview completo para o dashboard, filtrado por um intervalo de datas.
    """
    with Session(engine) as session:
        # Define o mês atual como padrão se nenhuma data for fornecida
        if not start_date or not end_date:
            today = date.today()
            start_date = today.replace(day=1)
            next_month = start_date.replace(day=28) + timedelta(days=4)
            end_date = next_month - timedelta(days=next_month.day)

        # Query base para despesas no período selecionado
        expense_query = (
            select(Expenses)
            .where(Expenses.user_id == current_user.id)
            .where(Expenses.expense_date >= start_date)
            .where(Expenses.expense_date <= end_date)
        )

        # --- 1. Calcular Cards de Resumo ---
        total_spent = session.exec(expense_query.with_only_columns(func.sum(Expenses.value))).one_or_none() or 0
        
        budget_query = select(func.sum(Budget.value)).where(Budget.user_id == current_user.id)
        total_budget = session.exec(budget_query).one_or_none() or 0

        # ========================================================================
        # CORREÇÃO APLICADA AQUI
        # ========================================================================
        # Categoria com maior gasto no período (forma corrigida)
        top_category_query = (
            select(Expenses.category)  # Seleciona APENAS o nome da categoria
            .where(Expenses.user_id == current_user.id)
            .where(Expenses.expense_date >= start_date)
            .where(Expenses.expense_date <= end_date)
            .group_by(Expenses.category)
            .order_by(func.sum(Expenses.value).desc()) # Ordena pelo gasto
        )
        # .first() agora retorna o nome da categoria (string) ou None
        top_category_result = session.exec(top_category_query).first()
        top_category = top_category_result if top_category_result else "N/A"
        # ========================================================================

        # --- 2. Dados para o Gráfico de Barras (Gastos Diários) ---
        daily_spending_query = (
            expense_query
            .with_only_columns(Expenses.expense_date.label("date"), func.sum(Expenses.value).label("value"))
            .group_by(Expenses.expense_date)
            .order_by(Expenses.expense_date)
        )
        daily_spending = session.exec(daily_spending_query).all()

        # --- 3. Dados para o Gráfico de Pizza (Distribuição) ---
        category_dist_query = (
            expense_query
            .with_only_columns(Expenses.category.label("name"), func.sum(Expenses.value).label("value"))
            .group_by(Expenses.category)
        )
        category_distribution = session.exec(category_dist_query).all()

        # --- 4. Dados para os Cards de Orçamento por Categoria ---
        user_budgets_query = select(Budget).where(Budget.user_id == current_user.id)
        budget_map = {b.name_category: b.value for b in session.exec(user_budgets_query).all()}
        
        category_spending_query = (
             expense_query
            .with_only_columns(Expenses.category, func.sum(Expenses.value).label("total"))
            .group_by(Expenses.category)
        )
        category_spending = {r.category: r.total for r in session.exec(category_spending_query).all()}

        category_budgets_overview = []
        for category_name, budget_value in budget_map.items():
            spent_value = category_spending.get(category_name, 0)
            category_budgets_overview.append({
                "category": category_name,
                "spent": spent_value,
                "budget": budget_value
            })

        return {
            "total_spent": total_spent,
            "total_budget": total_budget,
            "top_category": top_category,
            "daily_spending": daily_spending,
            "category_distribution": category_distribution,
            "category_budgets": category_budgets_overview,
        }