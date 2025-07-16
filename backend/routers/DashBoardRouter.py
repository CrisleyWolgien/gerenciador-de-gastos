from fastapi.routing import APIRouter
from fastapi import Depends, Query
from datetime import date, datetime, timedelta
from collections import defaultdict
from typing import Optional

from utils.jwt import get_current_user
from models.expenses import Users, Budget, Expenses
from schemas.DashboardSchema import DashboardOverview, DailySpending, CategoryData, CategoryBudgetStatus
from db import engine
from sqlmodel import Session, select
from sqlalchemy import func

router = APIRouter()

@router.get("/dashboard/overview", response_model=DashboardOverview)
def get_dashboard_overview(
    start_date: Optional[date] = Query(None, description="Data de início (YYYY-MM-DD). Padrão: início do mês atual."),
    end_date: Optional[date] = Query(None, description="Data de fim (YYYY-MM-DD). Padrão: fim do mês atual."),
    current_user: Users = Depends(get_current_user)
):
    """
    Retorna um overview completo com todos os dados necessários para o dashboard.
    """
    with Session(engine) as session:
        # Define o período padrão como o mês atual se as datas não forem fornecidas
        if not start_date or not end_date:
            today = datetime.now()
            start_date = today.replace(day=1).date()
            # Lógica para pegar o último dia do mês
            next_month = today.replace(day=28) + timedelta(days=4)
            end_date = (next_month - timedelta(days=next_month.day)).date()

        # 1. Busca todas as despesas e orçamentos do usuário de uma vez
        expenses_statement = select(Expenses).where(
            Expenses.user_id == current_user.id,
            Expenses.date_created >= start_date,
            Expenses.date_created <= end_date
        )
        user_expenses = session.exec(expenses_statement).all()

        budgets_statement = select(Budget).where(Budget.user_id == current_user.id)
        user_budgets = session.exec(budgets_statement).all()

        # 2. Processa os dados em memória (mais eficiente que múltiplas queries)
        
        # A. Cálculos gerais
        total_spent = sum(exp.value for exp in user_expenses)
        total_budget = sum(b.value for b in user_budgets)

        # B. Agrupa gastos por categoria e por dia
        spent_by_category = defaultdict(float)
        spent_by_day = defaultdict(float)
        for exp in user_expenses:
            spent_by_category[exp.category] += exp.value
            day_str = exp.date_created.strftime('%d/%m')
            spent_by_day[day_str] += exp.value
        
        # C. Encontra a categoria com maior gasto
        top_category = max(spent_by_category, key=spent_by_category.get) if spent_by_category else "N/A"

        # 3. Formata os dados para a resposta final, conforme o schema

        # Formata para o gráfico de gastos diários
        daily_spending_list = [
            DailySpending(day=day, value=value) for day, value in sorted(spent_by_day.items())
        ]

        # Formata para o gráfico de pizza de distribuição
        category_distribution_list = [
            CategoryData(name=cat, value=val) for cat, val in spent_by_category.items()
        ]

        # Formata para os cards de acompanhamento de orçamento
        budgets_dict = {b.name_category: b.value for b in user_budgets}
        category_budgets_list = [
            CategoryBudgetStatus(
                category=name,
                spent=spent_by_category.get(name, 0),
                budget=budgets_dict.get(name, 0)
            ) for name in budgets_dict
        ]

        return DashboardOverview(
            total_spent=total_spent,
            total_budget=total_budget,
            top_category=top_category,
            daily_spending=daily_spending_list,
            category_distribution=category_distribution_list,
            category_budgets=category_budgets_list
        )
